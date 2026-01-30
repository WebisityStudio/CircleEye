import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, APP_CONFIG, REPORT_CONFIG } from '../config/constants';
import type { InspectionSession, SessionFinding, InspectionReport } from '../types/session';

interface ReportData {
  session: InspectionSession;
  findings: SessionFinding[];
  report: InspectionReport | null;
  inspectorName: string;
  inspectorEmail: string;
}

/**
 * Generate PDF report from session data
 */
export async function generateReportPDF(data: ReportData): Promise<string> {
  const html = buildReportHTML(data);

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
 * Build HTML for PDF report
 */
function buildReportHTML(data: ReportData): string {
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

  const criticalCount = findings.filter((f) => f.severity === 'critical').length;
  const highCount = findings.filter((f) => f.severity === 'high').length;
  const mediumCount = findings.filter((f) => f.severity === 'medium').length;
  const lowCount = findings.filter((f) => f.severity === 'low').length;

  const findingsHTML = findings
    .map(
      (finding, index) => `
      <div class="finding">
        <div class="finding-header">
          <span class="finding-number">#${index + 1}</span>
          <span class="badge severity" style="background-color: ${getSeverityColor(finding.severity)}20; color: ${getSeverityColor(finding.severity)}">
            ${finding.severity.toUpperCase()}
          </span>
          <span class="badge category" style="background-color: ${getCategoryColor(finding.category)}20; color: ${getCategoryColor(finding.category)}">
            ${finding.category}
          </span>
        </div>
        <h4 class="finding-title">${finding.title}</h4>
        ${finding.description ? `<p class="finding-description">${finding.description}</p>` : ''}
        ${finding.location_hint ? `<p class="finding-location">📍 ${finding.location_hint}</p>` : ''}
        <p class="finding-timestamp">@ ${Math.floor(finding.timestamp_seconds / 60)}:${String(Math.floor(finding.timestamp_seconds % 60)).padStart(2, '0')}</p>
      </div>
    `
    )
    .join('');

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

        .summary-stats {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .stat-box {
          flex: 1;
          min-width: 100px;
          padding: 15px;
          text-align: center;
          background: ${COLORS.surfaceSecondary};
          border-radius: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
        }

        .stat-label {
          font-size: 12px;
          color: ${COLORS.textMuted};
        }

        .finding {
          padding: 15px;
          margin-bottom: 15px;
          background: #fff;
          border: 1px solid ${COLORS.border};
          border-radius: 8px;
          page-break-inside: avoid;
        }

        .finding-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .finding-number {
          font-size: 12px;
          font-weight: 600;
          color: ${COLORS.textMuted};
        }

        .badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .finding-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .finding-description {
          font-size: 14px;
          color: ${COLORS.textSecondary};
          margin-bottom: 8px;
        }

        .finding-location {
          font-size: 13px;
          color: ${COLORS.textMuted};
        }

        .finding-timestamp {
          font-size: 11px;
          color: ${COLORS.textMuted};
          font-family: monospace;
          margin-top: 8px;
        }

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
        <div class="subtitle">Site Risk Assessment Report</div>
        <h1 class="report-title">${session.site_name}</h1>
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

      <!-- Summary -->
      <div class="section">
        <h2 class="section-title">Summary</h2>
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

      <!-- Findings -->
      <div class="section">
        <h2 class="section-title">Findings (${findings.length})</h2>
        ${findings.length === 0 ? '<p style="color: ' + COLORS.textMuted + '">No findings recorded during this inspection.</p>' : findingsHTML}
      </div>

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
      </div>
    </body>
    </html>
  `;
}
