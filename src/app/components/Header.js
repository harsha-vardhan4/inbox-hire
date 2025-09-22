'use client';

import { useRouter } from 'next/navigation';
import { MdHome, MdSettings, MdOutlineCases, MdAccountCircle, MdDocumentScanner } from "react-icons/md";
import NotificationIcon from './NotificationIcon';

export default function Header({ currentPage }) {
  const router = useRouter();

  const handleIconClick = (iconName) => {
    if (iconName === 'home') {
      router.push('/');
    } else if (iconName === 'applications') {
      router.push('/applications');
    } else if (iconName === 'settings') {
      router.push('/settings');
    }
  };

  return (
    <header className="bg-background text-foreground py-4 px-6 flex justify-between items-center">
      {/* Left section: App Name */}
      <div className="flex items-center">
        <MdOutlineCases className="w-8 h-8 mr-3 text-foreground" />
        <div className="flex flex-col">
          <span className="text-3xl font-bold">Inbox Hire</span>
          <span className="text-xs font-medium mt-[-4px] text-foreground opacity-80">
            powered by <span className="font-semibold">Postmark</span>
          </span>
        </div>
      </div>

      {/* Center section: Menu Icons */}
      <div className="flex items-center space-x-6 flex-grow justify-center">
        <button
          className="p-2 rounded-full transition-transform duration-200 transform hover:scale-110"
          onClick={() => handleIconClick('home')}
        >
          <div
            className={`p-2 rounded-full border border-white flex items-center justify-center transition-colors duration-200 ${
              currentPage === 'home' ? 'bg-white text-background' : 'bg-transparent'
            }`}
          >
            <MdHome className="w-6 h-6" />
          </div>
        </button>

        <button
          className="p-2 rounded-full transition-transform duration-200 transform hover:scale-110"
          onClick={() => handleIconClick('applications')}
        >
          <div
            className={`p-2 rounded-full border border-white flex items-center justify-center transition-colors duration-200 ${
              currentPage === 'applications' ? 'bg-white text-background' : 'bg-transparent'
            }`}
          >
            <MdDocumentScanner className="w-6 h-6" />
          </div>
        </button>

        <button
          className="p-2 rounded-full transition-transform duration-200 transform hover:scale-110"
          onClick={() => handleIconClick('settings')}
        >
          <div
            className={`p-2 rounded-full border border-white flex items-center justify-center transition-colors duration-200 ${
              currentPage === 'settings' ? 'bg-white text-background' : 'bg-transparent'
            }`}
          >
            <MdSettings className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Right section: Notification and Profile Icons */}
      <div className="flex items-center space-x-4">
        <NotificationIcon className="p-2 rounded-full border border-white flex items-center justify-center"/>
        <button className="p-2 rounded-full transition-transform duration-200 transform hover:scale-110">
          <div className="p-2 rounded-full border border-white flex items-center justify-center">
            <MdAccountCircle className="w-8 h-8 text-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
}
