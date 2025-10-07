'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdHome,
  MdSettings,
  MdOutlineCases,
  MdAccountCircle,
  MdDocumentScanner,
  MdSearch,
} from "react-icons/md";
import NotificationIcon from './NotificationIcon';
import { useDate } from '../context/DateContext';  // Adjust path if needed

export default function Header({ currentPage }) {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useDate();
  const [loading, setLoading] = useState(false);

  const handleIconClick = (iconName) => {
    if (iconName === 'home') router.push('/');
    else if (iconName === 'applications') router.push('/applications');
    else if (iconName === 'settings') router.push('/settings');
  };

  const handleFetchEmails = async () => {
  if (!selectedDate) return alert('Please select a date');

  setLoading(true);

  try {
    const res = await fetch(`/api/get-emails?date=${encodeURIComponent(selectedDate)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'Failed to fetch emails');
    }

    // ✅ Log emails in the browser console
    console.log('📨 Emails received from server:', data.emails);

    alert('Emails fetched successfully! Check the console.');
    router.refresh(); // Refresh the page to re-fetch emails if needed
  } catch (err) {
    console.error('Error fetching emails:', err);
    alert(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  return (
    <header className="bg-background text-foreground py-4 px-6 flex justify-between items-center flex-wrap">
      {/* Left section: App Name */}
      <div className="flex items-center mb-2 sm:mb-0">
        <MdOutlineCases className="w-8 h-8 mr-3 text-foreground" />
        <div className="flex flex-col">
          <span className="text-3xl font-bold">Inbox Hire</span>
          <span className="text-xs font-medium mt-[-4px] text-foreground opacity-80">
            powered by <span className="font-semibold">Postmark</span>
          </span>
        </div>
      </div>

      {/* Center section: Menu Icons */}
      <div className="flex items-center space-x-6 flex-grow justify-center mb-2 sm:mb-0">
        {[
          { icon: MdHome, name: 'home' },
          { icon: MdDocumentScanner, name: 'applications' },
          { icon: MdSettings, name: 'settings' },
        ].map(({ icon: Icon, name }) => (
          <button
            key={name}
            className="p-2 rounded-full transition-transform duration-200 transform hover:scale-110"
            onClick={() => handleIconClick(name)}
          >
            <div
              className={`p-2 rounded-full border border-white flex items-center justify-center transition-colors duration-200 ${currentPage === name ? 'bg-white text-background' : 'bg-transparent'
                }`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </button>
        ))}
      </div>

      {/* Right section: Notification, Profile, and Date Search */}
      <div className="flex items-center space-x-4">
        <NotificationIcon className="p-2 rounded-full border border-white flex items-center justify-center" />

        {/* 📅 Date Input */}
        <input
          type="date"
          value={selectedDate || ''}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-black px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 🔍 Search Button */}
        <button
          onClick={handleFetchEmails}
          disabled={loading}
          className="bg-white text-black px-4 py-1 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Fetching...' : (
            <div className="flex items-center space-x-1">
              <MdSearch />
              <span>Search</span>
            </div>
          )}
        </button>

        {/* 👤 Profile Icon */}
        <button className="p-2 rounded-full transition-transform duration-200 transform hover:scale-110">
          <div className="p-2 rounded-full border border-white flex items-center justify-center">
            <MdAccountCircle className="w-8 h-8 text-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
}
