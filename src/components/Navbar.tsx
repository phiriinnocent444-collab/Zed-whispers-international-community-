import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  Flame,
  BarChart3,
  Mail,
  Shield,
  Gift,
  User,
  Plus,
  EyeOff,
  CheckCircle2,
  Database,
  MapPin,
  Calendar,
  QrCode,
  Compass,
  Bookmark,
  Search,
  X,
  MessageCircle,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { CurrentUser, StudentProfile, GossipPost, CampusEvent } from '../types';
import { searchAllCampusEntities, createWhatsAppDirectLink } from '../utils/rules';

interface NavbarProps {
  activeTab: 'feed' | 'dating' | 'secret_crush' | 'polls' | 'messages' | 'map' | 'calendar' | 'saved';
  setActiveTab: (tab: 'feed' | 'dating' | 'secret_crush' | 'polls' | 'messages' | 'map' | 'calendar' | 'saved') => void;
  currentUser: CurrentUser;
  onOpenComposer: () => void;
  onOpenProfile: () => void;
  onOpenPeerProfile?: (peer: StudentProfile) => void;
  onOpenSafety: () => void;
  onToggleGhostMode: () => void;
  onOpenQrModal: () => void;
  unreadCount: number;
  savedCount?: number;
  onOpenSupabase?: () => void;
  isSupabaseReady?: boolean;
  // Global search data & handlers
  profiles?: StudentProfile[];
  posts?: GossipPost[];
  events?: CampusEvent[];
  onSelectPost?: (post: GossipPost) => void;
  onSelectEvent?: (event: CampusEvent) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenComposer,
  onOpenProfile,
  onOpenPeerProfile,
  onOpenSafety,
  onToggleGhostMode,
  onOpenQrModal,
  unreadCount,
  savedCount = 0,
  onOpenSupabase,
  isSupabaseReady,
  profiles = [],
  posts = [],
  events = [],
  onSelectPost,
  onSelectEvent,
}) => {
  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFilterTab, setSearchFilterTab] = useState<'all' | 'peers' | 'posts' | 'events'>('all');
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl/Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSearchExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live search results
  const searchResults = searchAllCampusEntities(searchQuery, profiles, posts, events);

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setIsMobileSearchExpanded(false);
  };

  const handlePeerClick = (peer: StudentProfile) => {
    setIsSearchOpen(false);
    setIsMobileSearchExpanded(false);
    if (onOpenPeerProfile) {
      onOpenPeerProfile(peer);
    }
  };

  const handlePostClick = (post: GossipPost) => {
    setIsSearchOpen(false);
    setIsMobileSearchExpanded(false);
    if (onSelectPost) {
      onSelectPost(post);
    } else {
      setActiveTab('feed');
    }
  };

  const handleEventClick = (event: CampusEvent) => {
    setIsSearchOpen(false);
    setIsMobileSearchExpanded(false);
    if (onSelectEvent) {
      onSelectEvent(event);
    } else {
      setActiveTab('calendar');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2.5 lg:gap-4 h-16">
          {/* Zone 1: Logo & Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('feed')}
              className="flex items-center gap-2 text-left group cursor-pointer"
              aria-label="Go to ZedWhisper Home"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
              </div>
              <div>
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  Zed<span className="text-emerald-600 dark:text-emerald-400">Whisper</span>
                </span>
              </div>
            </button>
          </div>

          {/* GLOBAL SEARCH BAR (Desktop & Tablet) */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[190px] sm:min-w-[240px] max-w-md mx-1 sm:mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Search peers, posts, or campus events..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                aria-label="Search peers, whispers, and events"
              />
              {searchQuery ? (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden xl:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs pointer-events-none">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* GLOBAL SEARCH RESULTS FLOATING DROPDOWN */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 w-[90vw] sm:w-[480px] md:w-[540px] max-w-[560px] mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-3.5 max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Search Header & Filter Tabs */}
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Search Results
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      {searchResults.totalMatches} found
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(['all', 'peers', 'posts', 'events'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSearchFilterTab(tab)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                          searchFilterTab === tab
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tab === 'all'
                          ? 'All'
                          : tab === 'peers'
                          ? `Peers (${searchResults.peers.length})`
                          : tab === 'posts'
                          ? `Whispers (${searchResults.posts.length})`
                          : `Events (${searchResults.events.length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* No Results Fallback */}
                {searchResults.totalMatches === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      No results found for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-[11px]">
                      Search by student name, whisper topic, campus location, or sports event.
                    </p>
                  </div>
                )}

                {/* CATEGORY: PEERS */}
                {(searchFilterTab === 'all' || searchFilterTab === 'peers') && searchResults.peers.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verified Campus Peers ({searchResults.peers.length})</span>
                    </div>

                    <div className="space-y-1">
                      {searchResults.peers.slice(0, 4).map((peer) => {
                        const whatsappDirect = createWhatsAppDirectLink(
                          peer.phoneNumber || peer.whatsappNumber || '+260977234567',
                          peer.name,
                          peer.university
                        );

                        return (
                          <div
                            key={peer.id}
                            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-2"
                          >
                            <button
                              onClick={() => handlePeerClick(peer)}
                              className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {peer.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                                  <span>{peer.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">(@{peer.alias})</span>
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  <span className="uppercase font-semibold text-emerald-600">{peer.university}</span> · {peer.program}
                                </div>
                              </div>
                            </button>

                            {/* WhatsApp Direct Chat Trigger Button */}
                            <a
                              href={whatsappDirect}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center gap-1.5 text-[11px] font-bold shadow-xs shrink-0 cursor-pointer"
                              title={`Chat with ${peer.name} on WhatsApp`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                              <span className="hidden sm:inline">WhatsApp</span>
                              <ExternalLink className="w-3 h-3 opacity-80" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CATEGORY: POSTS / WHISPERS */}
                {(searchFilterTab === 'all' || searchFilterTab === 'posts') && searchResults.posts.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      <span>Campus Whispers ({searchResults.posts.length})</span>
                    </div>

                    <div className="space-y-1">
                      {searchResults.posts.slice(0, 4).map((post) => (
                        <button
                          key={post.id}
                          onClick={() => handlePostClick(post)}
                          className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/30 transition-all cursor-pointer block"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                              {post.university}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              #{post.category}
                            </span>
                            {post.is_saved && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5 ml-auto">
                                <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>Saved</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {post.title}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {post.content}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CATEGORY: CAMPUS EVENTS */}
                {(searchFilterTab === 'all' || searchFilterTab === 'events') && searchResults.events.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Campus Events ({searchResults.events.length})</span>
                    </div>

                    <div className="space-y-1">
                      {searchResults.events.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-indigo-600 uppercase">
                                {event.university}
                              </span>
                              <span className="text-[10px] text-slate-400">· {event.venue}</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {event.title}
                            </div>
                          </div>

                          <div className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded-lg shrink-0">
                            {event.date}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center gap-1 text-xs font-medium"
          >
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'feed'
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Campus Buzz</span>
            </button>

            {/* DEDICATED SAVED WHISPERS HEADER NAVIGATION VIEW */}
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'saved'
                  ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View whispers marked with is_saved: true"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Saved Whispers</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dating')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dating'
                  ? 'text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Encounters</span>
            </button>

            <button
              onClick={() => setActiveTab('secret_crush')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'secret_crush'
                  ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <EyeOff className="w-4 h-4 text-purple-500" />
              <span>Secret Crush</span>
            </button>

            <button
              onClick={() => setActiveTab('polls')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'polls'
                  ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>Polls</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'map'
                  ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 text-teal-600" />
              <span>Map</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Events</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`relative px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'messages'
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Whisper DMs</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Saved Whispers Icon Button for Mobile / Tablet */}
            <button
              onClick={() => setActiveTab('saved')}
              className={`xl:hidden flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Saved Whispers"
              aria-label="Saved Whispers"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              {savedCount > 0 && (
                <span className="text-[10px] font-bold">{savedCount}</span>
              )}
            </button>

            {/* Quick Campus Social QR Code Button */}
            <button
              onClick={onOpenQrModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
              title="My Campus Social QR Code & WhatsApp Direct Link"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">My QR</span>
            </button>

            {/* Quick Ghost Mode Persona Toggle */}
            <button
              onClick={onToggleGhostMode}
              title={currentUser.isGhostMode ? 'Incognito Ghost Mode is Active' : 'Verified Student Persona is Active'}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                currentUser.isGhostMode
                  ? 'bg-purple-900 text-purple-200 border-purple-700 shadow-inner'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              aria-label="Toggle Ghost Mode"
            >
              {currentUser.isGhostMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-purple-300" />
                  <span className="font-medium whitespace-nowrap">Ghost Active</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-medium whitespace-nowrap">Verified ID</span>
                </>
              )}
            </button>

            {/* Student Profile Button */}
            <button
              onClick={onOpenProfile}
              className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="View Student Profile"
              aria-label="Student Profile"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Primary Action Button: Post Whisper */}
            <button
              onClick={onOpenComposer}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Post Whisper</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation bar */}
      <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 grid grid-cols-7 py-1 text-center">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'feed' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span>Whispers</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`relative flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'saved' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Bookmark className="w-4 h-4 mb-0.5 text-amber-500" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-0 right-3 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold">
              {savedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('dating')}
          className={`flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'dating' ? 'text-pink-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Heart className="w-4 h-4 mb-0.5" />
          <span>Crush</span>
        </button>

        <button
          onClick={onOpenQrModal}
          className="flex flex-col items-center py-1 text-[10px] text-emerald-600 font-semibold cursor-pointer"
        >
          <QrCode className="w-4 h-4 mb-0.5 text-emerald-600" />
          <span>My QR</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'map' ? 'text-teal-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'calendar' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>Events</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`relative flex flex-col items-center py-1 text-[10px] cursor-pointer ${
            activeTab === 'messages' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Mail className="w-4 h-4 mb-0.5" />
          <span>DMs</span>
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-2 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
