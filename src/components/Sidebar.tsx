import React from 'react';
import { motion } from 'motion/react';
import { X, LogOut, Book, Mail, Github, ExternalLink } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDocs: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenDocs, onLogout }) => (
  <>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
      />
    )}

    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[70] shadow-2xl flex flex-col"
    >
      <div className="p-6 flex justify-between items-center border-b border-gray-100">
        <h2 className="text-2xl font-display font-bold text-burgundy">ChefCost</h2>
        <button onClick={onClose} className="p-2 hover:bg-creme rounded-full transition-colors">
          <X size={24} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Menu</h3>
          <button
            onClick={() => { onOpenDocs(); onClose(); }}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-creme transition-colors text-gray-700 font-medium"
          >
            <Book size={20} className="text-burgundy" />
            Documentação
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Desenvolvedor</h3>
          <div className="bg-creme p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail size={16} className="text-burgundy" />
              <span className="truncate">ezequeilerod2020@gmail.com</span>
            </div>
            <div className="flex gap-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-burgundy transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-burgundy transition-colors">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          Sair da Conta
        </button>
        <p className="text-[10px] text-center mt-4 text-gray-400 font-medium">Versão 1.0.0 • ChefCost</p>
      </div>
    </motion.div>
  </>
);
