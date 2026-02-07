import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { getAllUserProfiles } from '../supabase/db';
import type { UserProfile } from '../supabase/database.types';

const PAGE_SIZE = 20;

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count, error: fetchError } = await getAllUserProfiles({
        limit: PAGE_SIZE,
        offset: currentPage * PAGE_SIZE,
        searchQuery: debouncedSearch || undefined,
      });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setUsers(data || []);
      setTotalCount(count);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDisplayName = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.email.split('@')[0];
  };

  const getInitials = (user: UserProfile) => {
    if (user.first_name) {
      const firstInitial = user.first_name.charAt(0).toUpperCase();
      const lastInitial = user.last_name?.charAt(0).toUpperCase() || '';
      return firstInitial + lastInitial;
    }
    return user.email.charAt(0).toUpperCase();
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Fetch all users for export (no pagination)
      const { data: allUsers, error: fetchError } = await getAllUserProfiles({
        searchQuery: debouncedSearch || undefined,
      });

      if (fetchError || !allUsers) {
        alert('Failed to export users');
        return;
      }

      // CSV headers
      const headers = [
        'Email',
        'First Name',
        'Last Name',
        'Phone Number',
        'Company Name',
        'User Role',
        'Social Login Provider',
        'Created At',
      ];

      // CSV rows
      const rows = allUsers.map((user) => [
        user.email,
        user.first_name || '',
        user.last_name || '',
        user.phone_number || '',
        user.company_name || '',
        user.user_role || '',
        user.social_login_provider || '',
        user.created_at ? new Date(user.created_at).toISOString() : '',
      ]);

      // Build CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-text">
                Registered Users
              </h1>
              <p className="text-brand-textGrey text-sm">
                {totalCount} total user{totalCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-inputBackground text-brand-text rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={exporting || loading || totalCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-textGrey" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-brand-inputBackground border border-gray-700 rounded-lg text-brand-text placeholder-brand-textGrey focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card mb-6 bg-brand-error/10 border-brand-error">
            <p className="text-brand-error">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-inputBackground animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-brand-inputBackground rounded w-1/3 animate-pulse" />
                      <div className="h-3 bg-brand-inputBackground rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-brand-textGrey mx-auto mb-4" />
              <p className="text-brand-textGrey">
                {debouncedSearch
                  ? 'No users found matching your search'
                  : 'No registered users yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brand-inputBackground">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-brand-textGrey">
                        User
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-brand-textGrey">
                        Contact
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-brand-textGrey">
                        Company
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-brand-textGrey">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-brand-inputBackground/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-white">
                                {getInitials(user)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-brand-text truncate">
                                {getDisplayName(user)}
                              </p>
                              <p className="text-sm text-brand-textGrey truncate">
                                {user.user_role || 'User'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-brand-textGrey flex-shrink-0" />
                              <span className="text-brand-text truncate">
                                {user.email}
                              </span>
                            </div>
                            {user.phone_number && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-brand-textGrey flex-shrink-0" />
                                <span className="text-brand-textGrey">
                                  {user.phone_number}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-brand-text">
                            {user.company_name || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-brand-textGrey">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-800">
                {users.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">
                          {getInitials(user)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-text">
                          {getDisplayName(user)}
                        </p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-brand-textGrey flex-shrink-0" />
                            <span className="text-brand-textGrey truncate">
                              {user.email}
                            </span>
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-brand-textGrey flex-shrink-0" />
                              <span className="text-brand-textGrey">
                                {user.phone_number}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-brand-textGrey flex-shrink-0" />
                            <span className="text-brand-textGrey">
                              {formatDate(user.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-brand-textGrey">
              Showing {currentPage * PAGE_SIZE + 1} to{' '}
              {Math.min((currentPage + 1) * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg bg-brand-inputBackground text-brand-text hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-brand-text px-3">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded-lg bg-brand-inputBackground text-brand-text hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
