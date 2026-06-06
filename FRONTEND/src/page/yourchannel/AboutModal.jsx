import React from 'react';
import { X, Mail, Calendar, User } from 'lucide-react';
import { formatDate } from './formatters';

const AboutModal = ({ aboutModalOpen, setAboutModalOpen, aboutData }) => {
  if (!aboutModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={() => setAboutModalOpen(false)}
    >
      <div
        className="bg-black rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black/95 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">
            Channel Info
          </h3>
          <button
            onClick={() => setAboutModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!aboutData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-white shrink-0">
                  {aboutData.data?.displayName?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {aboutData.data?.displayName || "Your Channel"}
                  </h2>
                  <p className="text-sm text-zinc-500">Channel Details</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-6">
                
                {/* Description */}
                {aboutData.data?.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      About
                    </h4>
                    <p className="text-zinc-300 leading-relaxed text-sm">
                      {aboutData.data.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-900">
                  {/* Email */}
                  {aboutData.data?.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                          Contact
                        </h4>
                        <p className="text-sm text-zinc-300 font-mono break-all">
                          {aboutData.data.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Joined Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                        Joined
                      </h4>
                      <p className="text-sm text-zinc-300">
                        {formatDate(aboutData.data.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
        
        {/* Footer Action */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
           <button 
             onClick={() => setAboutModalOpen(false)}
             className="w-full py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors"
           >
             Close
           </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;