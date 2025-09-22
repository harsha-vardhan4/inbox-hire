'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getRecentApplications } from '../utils/data';
import { useSettings } from '../utils/useSettings';
import { useRealtimeUpdates } from '../utils/useRealtimeUpdates';

const ITEMS_PER_PAGE = 5;

export default function ApplicationsTable() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { settings } = useSettings();
  const { lastUpdate } = useRealtimeUpdates();
  const lastUpdateRef = useRef(lastUpdate);
  const router = useRouter();

  const loadApplications = async () => {
    try {
      const data = await getRecentApplications();
      const sortedData = [...data].sort((a, b) => {
        switch (settings.dashboard?.sortOrder || 'newest') {
          case 'newest':
            return new Date(b.date) - new Date(a.date);
          case 'oldest':
            return new Date(a.date) - new Date(b.date);
          case 'company':
            return a.company.localeCompare(b.company);
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
      setApplications(sortedData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [settings.dashboard?.sortOrder]);

  useEffect(() => {
    if (lastUpdate && lastUpdate !== lastUpdateRef.current) {
      lastUpdateRef.current = lastUpdate;
      loadApplications();
    }
  }, [lastUpdate]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadApplications();
    }, (settings?.dashboard?.refreshInterval || 5) * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings?.dashboard?.refreshInterval]);

  useEffect(() => {
    const handleFocus = () => loadApplications();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });

  const itemsPerPage = settings.dashboard?.itemsPerPage || 10;
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const currentApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (id) => router.push(`/applications/${id}`);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[#CBD5E1]/20 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search applications..."
          className="w-full md:w-auto px-4 py-3 rounded-xl border border-[#CBD5E1]/40 bg-[#F8FAFC]/80 dark:bg-[#001A3A]/60 text-[#002153] dark:text-white placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all duration-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-3 rounded-xl border border-[#CBD5E1]/40 bg-[#F8FAFC]/80 dark:bg-[#001A3A]/60 text-[#002153] dark:text-white focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all duration-200"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
          <option value="in-progress">In Progress</option>
        </select>
        <button
          className="px-4 py-2 rounded-xl bg-[#002153] text-white font-semibold hover:bg-[#001A3A] transition-all duration-200 shadow-lg hover:shadow-[#002153]/30 transform hover:scale-105"
          onClick={() => router.push('/applications')}
        >
          View All Applications
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-[#CBD5E1]/30 bg-white dark:bg-[#001A3A] shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#CBD5E1]/30 dark:divide-[#CBD5E1]/15">
            <thead>
              <tr>
                {['Position', 'Company', 'Status', 'Date'].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-left text-xs font-semibold text-[#002153] dark:text-white uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]/20 dark:divide-[#CBD5E1]/10">
              {currentApplications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => handleRowClick(app.id)}
                  className="cursor-pointer transition-all hover:bg-[#E6F0FA] dark:hover:bg-[#0D1B2A]"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#002153] dark:text-white">{app.jobTitle}</td>
                  <td className="px-6 py-4 text-sm text-[#475569] dark:text-[#CBD5E1]">{app.company}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-full ${
                        app.status === 'interview'
                          ? 'bg-[#D1E9FF] text-[#0C4A6E] dark:bg-[#0C4A6E]/30 dark:text-[#D1E9FF]'
                          : app.status === 'offer'
                          ? 'bg-[#CFFDD8] text-[#064E3B] dark:bg-[#064E3B]/30 dark:text-[#CFFDD8]'
                          : app.status === 'rejected'
                          ? 'bg-[#FFE5E5] text-[#7F1D1D] dark:bg-[#7F1D1D]/30 dark:text-[#FFE5E5]'
                          : 'bg-[#FDE68A] text-[#92400E] dark:bg-[#92400E]/30 dark:text-[#FDE68A]'
                      }`}
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B] dark:text-[#CBD5E1]">
                    {new Date(app.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === page
                  ? 'bg-[#002153] text-white shadow-lg'
                  : 'bg-[#F8FAFC] text-[#002153] hover:bg-[#E2E8F0] dark:bg-[#0D1B2A] dark:text-white dark:hover:bg-[#1E293B]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {currentApplications.length === 0 && (
        <div className="text-center py-12 text-[#64748B] dark:text-[#CBD5E1]">
          No applications found.
        </div>
      )}
    </div>
  );
}
