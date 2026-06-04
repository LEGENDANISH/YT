import React from 'react';
import { X } from 'lucide-react';
import { formatDate } from './formatters';

const AboutModal = ({ aboutModalOpen, setAboutModalOpen, aboutData }) => {
  if (!aboutModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={() => setAboutModalOpen(false)}
    >
      <div
        className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
            About This Channel
          </h3>
          <button
            onClick={() => setAboutModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!aboutData ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Channel Name</h4>
                <p className="text-lg font-medium">{aboutData.data.displayName || 'Your Channel'}</p>
              </div>
              {aboutData.description && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Description</h4>
                  <p className="text-slate-300">{aboutData.description}</p>
                </div>
              )}
              {aboutData.email && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Email</h4>
                  <p className="text-slate-300 font-mono">{aboutData.data.email}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Joined</h4>
                <p className="text-slate-300">{formatDate(aboutData.data.createdAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutModal;