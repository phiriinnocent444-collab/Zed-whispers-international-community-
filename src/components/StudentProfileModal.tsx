import React, { useState } from 'react';
import { CurrentUser, StudentProfile } from '../types';
import { UNIVERSITIES } from '../data/mockData';
import { createWhatsAppDirectLink } from '../utils/rules';
import {
  X,
  User,
  GraduationCap,
  ShieldCheck,
  Gift,
  Ghost,
  CheckCircle2,
  Bookmark,
  Heart,
  Smartphone,
  Trash2,
  Sparkles,
  MessageCircle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  peerProfile?: StudentProfile | null;
  onToggleGhostMode: () => void;
  onClearSession: () => void;
  onOpenQrModal?: () => void;
  onStartChatWithPeer?: (profile: StudentProfile) => void;
  onSendGiftToPeer?: (profile: StudentProfile) => void;
  onDropCrushOnPeer?: (alias: string) => void;
  onUpdateCurrentUserPhone?: (phone: string) => void;
  onUpdateCurrentUserProfile?: (updated: Partial<CurrentUser>) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  peerProfile,
  onToggleGhostMode,
  onClearSession,
  onOpenQrModal,
  onStartChatWithPeer,
  onSendGiftToPeer,
  onDropCrushOnPeer,
  onUpdateCurrentUserPhone,
  onUpdateCurrentUserProfile,
}) => {
  const isViewingPeer = Boolean(peerProfile);
  const isBlankUser = !currentUser.realName || !currentUser.alias;
  const [isEditingFullProfile, setIsEditingFullProfile] = useState(isBlankUser && !isViewingPeer);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumberInput, setPhoneNumberInput] = useState(currentUser.phoneNumber || '');

  // Full form state for registration / editing
  const [formRealName, setFormRealName] = useState(currentUser.realName || '');
  const [formAlias, setFormAlias] = useState(currentUser.alias || '');
  const [formUniversity, setFormUniversity] = useState(currentUser.university || 'unza');
  const [formCampus, setFormCampus] = useState(currentUser.campus || '');
  const [formProgram, setFormProgram] = useState(currentUser.program || '');
  const [formYear, setFormYear] = useState(currentUser.year || 1);
  const [formPhone, setFormPhone] = useState(currentUser.phoneNumber || '');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const profileUniId = isViewingPeer ? peerProfile!.university : (formUniversity || currentUser.university);
  const currentUni = UNIVERSITIES.find((u) => u.id === profileUniId) || UNIVERSITIES[0];

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCurrentUserPhone) {
      onUpdateCurrentUserPhone(phoneNumberInput);
    }
    setIsEditingPhone(false);
  };

  const handleSaveFullProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRealName.trim()) {
      setFormError('Please enter your full student name.');
      return;
    }
    if (!formAlias.trim()) {
      setFormError('Please enter a campus handle or alias.');
      return;
    }
    if (!formProgram.trim()) {
      setFormError('Please enter your program/degree of study.');
      return;
    }

    if (onUpdateCurrentUserProfile) {
      onUpdateCurrentUserProfile({
        realName: formRealName.trim(),
        alias: formAlias.trim().replace(/^@/, ''),
        university: formUniversity,
        campus: formCampus.trim() || 'Main Campus',
        program: formProgram.trim(),
        year: Number(formYear) || 1,
        phoneNumber: formPhone.trim() || '+260971000000',
        isVerifiedStudent: true,
      });
    }
    setIsEditingFullProfile(false);
    setFormError(null);
  };

  // WhatsApp link for peer or current user
  const targetPhone = isViewingPeer
    ? peerProfile?.phoneNumber || peerProfile?.whatsappNumber || '+260977234567'
    : currentUser.phoneNumber || formPhone || '+260971112233';

  const rawName = isViewingPeer ? peerProfile!.name : (currentUser.realName || 'Setup Student ID');
  const rawAlias = isViewingPeer ? peerProfile!.alias : (currentUser.alias || 'unverified_student');
  const initialLetter = (rawName.charAt(0) || 'S').toUpperCase();

  const whatsappDirectUrl = createWhatsAppDirectLink(
    targetPhone,
    rawName,
    currentUni.shortName
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {initialLetter}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{rawName}</span>
                {currentUser.isVerifiedStudent && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                {isViewingPeer ? (
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Peer Profile
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-800">
                    {isBlankUser ? 'Student Setup' : 'My Profile'}
                  </span>
                )}
              </h2>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                @{rawAlias}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* If Editing Full Profile (or User is completely blank) */}
          {!isViewingPeer && isEditingFullProfile ? (
            <form onSubmit={handleSaveFullProfile} className="space-y-3.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {isBlankUser ? 'Enter Required Student Information' : 'Update Your Student Profile'}
                  </span>
                </div>
                {!isBlankUser && (
                  <button
                    type="button"
                    onClick={() => setIsEditingFullProfile(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px]">
                  ⚠️ {formError}
                </div>
              )}

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Provide your authentic university details below to verify your student account and unlock posting to the Campus Buzz.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Real Student Name *
                </label>
                <input
                  type="text"
                  value={formRealName}
                  onChange={(e) => setFormRealName(e.target.value)}
                  placeholder="e.g. Chanda Musonda"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Alias / Nickname *
                  </label>
                  <input
                    type="text"
                    value={formAlias}
                    onChange={(e) => setFormAlias(e.target.value)}
                    placeholder="e.g. Chanda_UNZA"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    University / Institution *
                  </label>
                  <select
                    value={formUniversity}
                    onChange={(e) => setFormUniversity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {UNIVERSITIES.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.shortName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Branch / Zone
                  </label>
                  <input
                    type="text"
                    value={formCampus}
                    onChange={(e) => setFormCampus(e.target.value)}
                    placeholder="e.g. Great East Road / Dushanbe Road / Church Road"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                    <option value={5}>5th Year (Finalist / Clinical / Medics)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Program of Study / Major *
                </label>
                <input
                  type="text"
                  value={formProgram}
                  onChange={(e) => setFormProgram(e.target.value)}
                  placeholder="e.g. Bachelor of Public Administration / BSc Computer Science"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Phone Number (wa.me) *
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+260971234567"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Protected by anti-doxxing privacy shield. Never displayed on public posts. Used only for peer WhatsApp connect.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Verify My Student Identity</span>
              </button>
            </form>
          ) : (
            <>
              {/* Academic Affiliation Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>{currentUni.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {currentUser.isVerifiedStudent ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        Verified Student
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        Unverified
                      </span>
                    )}
                    {!isViewingPeer && (
                      <button
                        onClick={() => setIsEditingFullProfile(true)}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {isViewingPeer ? peerProfile?.program : (currentUser.program || 'Program not specified')}
                  </p>
                  <p className="text-slate-500">
                    {isViewingPeer ? peerProfile?.campus : (currentUser.campus || 'Campus branch not specified')} · Year{' '}
                    {isViewingPeer ? peerProfile?.yearOfStudy : currentUser.year}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* WHATSAPP DIRECT CHAT ACTION SECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-teal-500/10 border border-emerald-300/80 dark:border-emerald-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-4 h-4 fill-white/20" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <span>Direct WhatsApp Connect</span>
                    <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                      wa.me
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isViewingPeer
                      ? `Chat with ${peerProfile?.name} via direct WhatsApp link without exposing private profile details to the public feed.`
                      : 'Students you connect with can launch direct WhatsApp conversations securely.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Shield Disclaimer */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>
                <strong>Anti-Doxxing Privacy Shield:</strong> Phone numbers are kept secure and never posted to public whispers or comments.
              </span>
            </div>

            {/* Launch WhatsApp Button */}
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              title={`Initiate WhatsApp chat with ${rawName}`}
            >
              <MessageCircle className="w-4 h-4 fill-white/30" />
              <span>
                {isViewingPeer ? `Chat with ${peerProfile?.name} on WhatsApp` : 'Test My Direct WhatsApp Link'}
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* If Current User, allow updating Zambian phone number */}
            {!isViewingPeer && (
              <div className="pt-1">
                {!isEditingPhone ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Registered Number:{' '}
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {currentUser.phoneNumber || '+260971112233'}
                      </strong>
                    </span>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                    >
                      Update Number
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSavePhone} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      placeholder="+260971234567"
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(false)}
                      className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Peer Bio & Interests (When viewing a peer) */}
          {isViewingPeer && peerProfile && (
            <>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  About {peerProfile.name}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  {peerProfile.bio}
                </p>

                {peerProfile.hangoutSpot && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Favorite Campus Spot: {peerProfile.hangoutSpot}</span>
                  </p>
                )}
              </div>

              {/* Interests Tags */}
              {peerProfile.interests && peerProfile.interests.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Interests & Campus Passions:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {peerProfile.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Peer Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {onStartChatWithPeer && (
                  <button
                    onClick={() => {
                      onStartChatWithPeer(peerProfile);
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Whisper DM</span>
                  </button>
                )}

                {onSendGiftToPeer && (
                  <button
                    onClick={() => {
                      onSendGiftToPeer(peerProfile);
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Send Treat</span>
                  </button>
                )}

                {onDropCrushOnPeer && (
                  <button
                    onClick={() => {
                      onDropCrushOnPeer(peerProfile.alias);
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Drop Crush</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Current User Sections (When viewing own profile) */}
          {!isViewingPeer && (
            <>
              {/* Persona Mode Switch */}
              <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                      {currentUser.isGhostMode ? (
                        <Ghost className="w-4 h-4 text-purple-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>
                        Active Persona:{' '}
                        {currentUser.isGhostMode ? 'Incognito Ghost Mode' : 'Verified Identity'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">
                      {currentUser.isGhostMode
                        ? 'Your real name and verified ID are hidden on all new posts and comments.'
                        : 'Your verified campus badge (@' + currentUser.alias + ') is visible.'}
                    </p>
                  </div>

                  <button
                    onClick={onToggleGhostMode}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentUser.isGhostMode ? 'bg-purple-700 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    Switch
                  </button>
                </div>
              </div>

              {/* Campus QR Button */}
              {onOpenQrModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenQrModal();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs flex items-center justify-between shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Show My Campus Social QR Code</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">
                    Instant Connect
                  </span>
                </button>
              )}

              {/* Student Activity & Karma Stats */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Campus Activity & Social Karma
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Gift className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                    <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white block">
                      {currentUser.treatsSentCount}
                    </span>
                    <span className="text-[10px] text-slate-500">Treats Sent</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white block">
                      {currentUser.secretCrushesSubmitted.length}
                    </span>
                    <span className="text-[10px] text-slate-500">Secret Crushes</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Bookmark className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white block">
                      {currentUser.bookmarkedPostIds.length}
                    </span>
                    <span className="text-[10px] text-slate-500">Saved Whispers</span>
                  </div>
                </div>
              </div>

              {/* Emergency Panic Wipe Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span>Public Lab Session?</span>
                </div>

                <button
                  onClick={onClearSession}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Panic Wipe & Reset Session</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            ZedWhisper Verified Student Profile
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
