import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, APP_CONFIG, REPORT_CONFIG } from '../config/constants';
import { generateComplianceAnalysis, ComplianceAnalysis } from '../services/geminiProService';
import type { InspectionSession, SessionFinding, InspectionReport } from '../types/session';

interface ReportData {
  session: InspectionSession;
  findings: SessionFinding[];
  report: InspectionReport | null;
  inspectorName: string;
  inspectorEmail: string;
}

/**
 * Generate PDF report from session data with Gemini 3 Pro compliance analysis
 */
export async function generateReportPDF(data: ReportData): Promise<string> {
  // Generate compliance analysis using Gemini 3 Pro
  console.log('Generating compliance analysis with Gemini 3 Pro...');
  const complianceAnalysis = await generateComplianceAnalysis(data.session, data.findings);
  console.log('Compliance analysis complete:', complianceAnalysis.overallRiskLevel);

  const html = buildReportHTML(data, complianceAnalysis);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  return uri;
}

/**
 * Share the generated PDF
 */
export async function sharePDF(uri: string, title: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: title,
      UTI: 'com.adobe.pdf',
    });
  }
}

/**
 * Build HTML for PDF report with Gemini 3 Pro compliance analysis
 */
function buildReportHTML(data: ReportData, analysis: ComplianceAnalysis): string {
  const { session, findings, inspectorName, inspectorEmail } = data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: COLORS.critical,
      high: COLORS.high,
      medium: COLORS.medium,
      low: COLORS.low,
    };
    return colors[severity] || COLORS.textMuted;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      safety: COLORS.safety,
      security: '#7C3AED',
      compliance: COLORS.compliance,
      maintenance: COLORS.maintenance,
    };
    return colors[category] || COLORS.textMuted;
  };

  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: COLORS.critical,
      high: COLORS.high,
      medium: COLORS.medium,
      low: COLORS.success,
    };
    return colors[level] || COLORS.textMuted;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      immediate: 'IMMEDIATE ACTION',
      urgent: 'URGENT',
      soon: 'SOON',
      scheduled: 'SCHEDULED',
    };
    return labels[priority] || priority.toUpperCase();
  };

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const highCount = findings.filter((f) => f.severity === 'high').length;
  const mediumCount = findings.filter((f) => f.severity === 'medium').length;
  const lowCount = findings.filter((f) => f.severity === 'low').length;

  // Build analyzed findings HTML
  const analyzedFindingsHTML = analysis.keyFindings
    .map(
      (af, index) => `
      <div class="finding">
        <div class="finding-header">
          <span class="finding-number">#${index + 1}</span>
          <span class="badge severity" style="background-color: ${getSeverityColor(af.originalFinding.severity)}20; color: ${getSeverityColor(af.originalFinding.severity)}">
            ${af.originalFinding.severity.toUpperCase()}
          </span>
          <span class="badge category" style="background-color: ${getCategoryColor(af.originalFinding.category)}20; color: ${getCategoryColor(af.originalFinding.category)}">
            ${af.originalFinding.category}
          </span>
          <span class="badge priority" style="background-color: ${af.remediationPriority === 'immediate' ? COLORS.critical : af.remediationPriority === 'urgent' ? COLORS.high : COLORS.medium}20; color: ${af.remediationPriority === 'immediate' ? COLORS.critical : af.remediationPriority === 'urgent' ? COLORS.high : COLORS.medium}">
            ${getPriorityLabel(af.remediationPriority)}
          </span>
        </div>
        <h4 class="finding-title">${af.originalFinding.title}</h4>
        ${af.originalFinding.description ? `<p class="finding-description">${af.originalFinding.description}</p>` : ''}
        ${af.originalFinding.location_hint ? `<p class="finding-location">📍 ${af.originalFinding.location_hint}</p>` : ''}

        <div class="compliance-analysis">
          <div class="analysis-row">
            <span class="analysis-label">Compliance Impact:</span>
            <span class="analysis-value">${af.complianceImpact}</span>
          </div>
          <div class="analysis-row">
            <span class="analysis-label">Relevant Standard:</span>
            <span class="analysis-value standard-ref">${af.relevantStandard}</span>
          </div>
          <div class="analysis-row">
            <span class="analysis-label">Remediation Timeline:</span>
            <span class="analysis-value">${af.estimatedRemediationTime}</span>
          </div>
          <div class="analysis-row">
            <span class="analysis-label">If Not Addressed:</span>
            <span class="analysis-value warning-text">${af.potentialConsequences}</span>
          </div>
        </div>
      </div>
    `
    )
    .join('');

  // Build recommendations HTML
  const recommendationsHTML = analysis.recommendations
    .map(
      (rec) => `
      <tr>
        <td class="priority-cell">${rec.priority}</td>
        <td>${rec.action}</td>
        <td>${rec.responsibility}</td>
        <td>${rec.timeline}</td>
        <td class="standard-cell">${rec.standard}</td>
      </tr>
    `
    )
    .join('');

  // Build regulatory references HTML
  const regulatoryHTML = analysis.regulatoryReferences
    .map(
      (ref) => `
      <div class="reg-item">
        <div class="reg-name">${ref.regulation}</div>
        <div class="reg-section">${ref.section}</div>
        <div class="reg-relevance">${ref.relevance}</div>
      </div>
    `
    )
    .join('');

  // Build next steps HTML
  const nextStepsHTML = analysis.nextSteps.map((step) => `<li>${step}</li>`).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Site Inspection Report - ${session.site_name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: ${COLORS.textPrimary};
          line-height: 1.5;
          padding: 40px;
          background: #fff;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid ${COLORS.primary};
        }

        .logo {
          font-size: 28px;
          font-weight: bold;
          color: ${COLORS.primary};
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 14px;
          color: ${COLORS.textSecondary};
        }

        .report-title {
          font-size: 24px;
          font-weight: bold;
          margin-top: 20px;
        }

        .ai-badge {
          display: inline-block;
          margin-top: 10px;
          padding: 4px 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 12px;
        }

        .section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: ${COLORS.primary};
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid ${COLORS.border};
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .info-item {
          padding: 12px;
          background: ${COLORS.surfaceSecondary};
          border-radius: 8px;
        }

        .info-label {
          font-size: 12px;
          color: ${COLORS.textMuted};
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 500;
        }

        /* Executive Summary */
        .executive-summary {
          padding: 20px;
          background: linear-gradient(135deg, ${COLORS.primary}10 0%, ${COLORS.secondary}10 100%);
          border-radius: 12px;
          border-left: 4px solid ${COLORS.primary};
          margin-bottom: 20px;
        }

        .executive-summary-text {
          font-size: 15px;
          line-height: 1.6;
          color: ${COLORS.textPrimary};
        }

        /* Risk Assessment */
        .risk-assessment {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: ${COLORS.surfaceSecondary};
          border-radius: 12px;
        }

        .risk-score {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }

        .risk-score-value {
          font-size: 32px;
        }

        .risk-score-label {
          font-size: 10px;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .risk-details {
          flex: 1;
        }

        .risk-level {
          font-size: 20px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .summary-stats {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .stat-box {
          flex: 1;
          min-width: 80px;
          padding: 15px;
          text-align: center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
        }

        .stat-label {
          font-size: 11px;
          color: ${COLORS.textMuted};
        }

        /* Findings */
        .finding {
          padding: 20px;
          margin-bottom: 15px;
          background: #fff;
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          page-break-inside: avoid;
        }

        .finding-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .finding-number {
          font-size: 12px;
          font-weight: 600;
          color: ${COLORS.textMuted};
        }

        .badge {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .finding-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: ${COLORS.textPrimary};
        }

        .finding-description {
          font-size: 14px;
          color: ${COLORS.textSecondary};
          margin-bottom: 8px;
        }

        .finding-location {
          font-size: 13px;
          color: ${COLORS.textMuted};
          margin-bottom: 12px;
        }

        /* Compliance Analysis Box */
        .compliance-analysis {
          margin-top: 15px;
          padding: 15px;
          background: ${COLORS.surfaceSecondary};
          border-radius: 8px;
          border-left: 3px solid ${COLORS.primary};
        }

        .analysis-row {
          margin-bottom: 8px;
        }

        .analysis-row:last-child {
          margin-bottom: 0;
        }

        .analysis-label {
          font-size: 11px;
          font-weight: 600;
          color: ${COLORS.textMuted};
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }

        .analysis-value {
          font-size: 13px;
          color: ${COLORS.textPrimary};
        }

        .standard-ref {
          color: ${COLORS.primary};
          font-weight: 500;
        }

        .warning-text {
          color: ${COLORS.high};
        }

        /* Recommendations Table */
        .recommendations-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .recommendations-table th {
          background: ${COLORS.primary};
          color: white;
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
        }

        .recommendations-table td {
          padding: 12px 10px;
          border-bottom: 1px solid ${COLORS.border};
          vertical-align: top;
        }

        .recommendations-table tr:nth-child(even) {
          background: ${COLORS.surfaceSecondary};
        }

        .priority-cell {
          width: 50px;
          text-align: center;
          font-weight: 600;
          color: ${COLORS.primary};
        }

        .standard-cell {
          font-size: 11px;
          color: ${COLORS.textMuted};
        }

        /* Regulatory References */
        .reg-item {
          padding: 15px;
          margin-bottom: 10px;
          background: ${COLORS.surfaceSecondary};
          border-radius: 8px;
          border-left: 3px solid ${COLORS.compliance};
        }

        .reg-name {
          font-weight: 600;
          color: ${COLORS.textPrimary};
          margin-bottom: 4px;
        }

        .reg-section {
          font-size: 12px;
          color: ${COLORS.primary};
          font-weight: 500;
          margin-bottom: 4px;
        }

        .reg-relevance {
          font-size: 13px;
          color: ${COLORS.textSecondary};
        }

        /* Next Steps */
        .next-steps-list {
          padding-left: 20px;
        }

        .next-steps-list li {
          font-size: 14px;
          color: ${COLORS.textPrimary};
          margin-bottom: 8px;
          padding-left: 8px;
        }

        /* Disclaimer */
        .disclaimer {
          padding: 20px;
          background: #FFF8E6;
          border-radius: 8px;
          border-left: 4px solid ${COLORS.warning};
        }

        .disclaimer-title {
          font-size: 14px;
          font-weight: 600;
          color: ${COLORS.warning};
          margin-bottom: 10px;
        }

        .disclaimer-text {
          font-size: 12px;
          color: ${COLORS.textSecondary};
        }

        .disclaimer-list {
          margin-top: 10px;
          padding-left: 20px;
        }

        .disclaimer-list li {
          font-size: 12px;
          color: ${COLORS.textSecondary};
          margin-bottom: 4px;
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid ${COLORS.border};
          text-align: center;
        }

        .footer-text {
          font-size: 11px;
          color: ${COLORS.textMuted};
        }

        .powered-by {
          margin-top: 10px;
          font-size: 10px;
          color: ${COLORS.textMuted};
        }

        .powered-by strong {
          color: ${COLORS.primary};
        }

        .signature-section {
          margin-top: 30px;
          padding: 20px;
          background: ${COLORS.surfaceSecondary};
          border-radius: 8px;
        }

        .signature-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .signature-line {
          margin-top: 40px;
          padding-top: 10px;
          border-top: 1px solid ${COLORS.textMuted};
          font-size: 12px;
          color: ${COLORS.textMuted};
        }

        @media print {
          body {
            padding: 20px;
          }
          .finding {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo">${APP_CONFIG.name}</div>
        <div class="subtitle">AI-Powered Site Risk Assessment Report</div>
        <h1 class="report-title">${session.site_name}</h1>
        <div class="ai-badge">✨ Powered by Gemini 3 Pro</div>
      </div>

      <!-- Site Information -->
      <div class="section">
        <h2 class="section-title">Site Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Site Name/Number</div>
            <div class="info-value">${session.site_name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Address</div>
            <div class="info-value">${session.site_address || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">GPS Coordinates</div>
            <div class="info-value">${session.site_latitude.toFixed(6)}, ${session.site_longitude.toFixed(6)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Inspection Date</div>
            <div class="info-value">${formatDate(session.started_at)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Duration</div>
            <div class="info-value">${formatDuration(session.duration_seconds)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Inspector</div>
            <div class="info-value">${inspectorName}</div>
          </div>
        </div>
      </div>

      <!-- Executive Summary -->
      <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="executive-summary">
          <p class="executive-summary-text">${analysis.executiveSummary}</p>
        </div>

        <!-- Risk Assessment -->
        <div class="risk-assessment">
          <div class="risk-score" style="background: ${getRiskLevelColor(analysis.overallRiskLevel)}">
            <span class="risk-score-value">${analysis.riskScore}</span>
            <span class="risk-score-label">Risk Score</span>
          </div>
          <div class="risk-details">
            <div class="risk-level" style="color: ${getRiskLevelColor(analysis.overallRiskLevel)}">
              ${analysis.overallRiskLevel} Risk
            </div>
            <div class="summary-stats">
              <div class="stat-box">
                <div class="stat-value" style="color: ${COLORS.primary}">${findings.length}</div>
                <div class="stat-label">Total Findings</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" style="color: ${COLORS.critical}">${criticalCount}</div>
                <div class="stat-label">Critical</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" style="color: ${COLORS.high}">${highCount}</div>
                <div class="stat-label">High</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" style="color: ${COLORS.medium}">${mediumCount}</div>
                <div class="stat-label">Medium</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" style="color: ${COLORS.low}">${lowCount}</div>
                <div class="stat-label">Low</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Findings with Compliance Analysis -->
      <div class="section">
        <h2 class="section-title">Detailed Findings & Compliance Analysis</h2>
        ${findings.length === 0 ? '<p style="color: ' + COLORS.textMuted + '">No findings recorded during this inspection.</p>' : analyzedFindingsHTML}
      </div>

      <!-- Recommendations -->
      ${
        analysis.recommendations.length > 0
          ? `
      <div class="section">
        <h2 class="section-title">Prioritized Recommendations</h2>
        <table class="recommendations-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Action Required</th>
              <th>Responsibility</th>
              <th>Timeline</th>
              <th>Standard Reference</th>
            </tr>
          </thead>
          <tbody>
            ${recommendationsHTML}
          </tbody>
        </table>
      </div>
      `
          : ''
      }

      <!-- Regulatory References -->
      ${
        analysis.regulatoryReferences.length > 0
          ? `
      <div class="section">
        <h2 class="section-title">Applicable Regulations & Standards</h2>
        ${regulatoryHTML}
      </div>
      `
          : ''
      }

      <!-- Next Steps -->
      ${
        analysis.nextSteps.length > 0
          ? `
      <div class="section">
        <h2 class="section-title">Recommended Next Steps</h2>
        <ol class="next-steps-list">
          ${nextStepsHTML}
        </ol>
      </div>
      `
          : ''
      }

      <!-- Disclaimer -->
      <div class="section">
        <div class="disclaimer">
          <div class="disclaimer-title">⚠️ Disclaimer</div>
          <p class="disclaimer-text">${REPORT_CONFIG.defaultDisclaimer.scope}</p>
          <p class="disclaimer-text" style="margin-top: 10px; font-weight: 500;">Limitations:</p>
          <ul class="disclaimer-list">
            ${REPORT_CONFIG.defaultDisclaimer.limitations.map((l) => `<li>${l}</li>`).join('')}
          </ul>
          <p class="disclaimer-text" style="margin-top: 10px; font-weight: 500;">This report is not a substitute for:</p>
          <ul class="disclaimer-list">
            ${REPORT_CONFIG.defaultDisclaimer.not_a_substitute_for.map((l) => `<li>${l}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Signature -->
      <div class="signature-section">
        <div class="signature-title">Inspector Acknowledgment</div>
        <p style="font-size: 13px; color: ${COLORS.textSecondary}">
          I confirm that this inspection was conducted by me and the findings accurately reflect what was observed during the walkthrough.
        </p>
        <div class="signature-line">
          ${inspectorName} (${inspectorEmail})
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          Generated by ${APP_CONFIG.name} • ${APP_CONFIG.company}<br>
          ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        <p class="powered-by">
          AI Analysis by <strong>Gemini 3 Flash</strong> (Real-time Detection) & <strong>Gemini 3 Pro</strong> (Compliance Reasoning)
        </p>
      </div>
    </body>
    </html>
  `;
}
