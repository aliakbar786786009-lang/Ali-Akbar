import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  MapPin,
  Globe,
  Mail,
  CheckCircle2,
  X,
  Send,
  ExternalLink,
} from 'lucide-react';
import { User, CatalogItemData } from '../types';
import { useChat } from '../context/ChatContext';

interface BusinessCatalogModalProps {
  businessUser: User;
  onClose: () => void;
  onSelectItem?: (item: CatalogItemData) => void;
}

export const BusinessCatalogModal: React.FC<BusinessCatalogModalProps> = ({
  businessUser,
  onClose,
  onSelectItem,
}) => {
  const { sendCatalogInquiry, chats, createChat, setActiveChat, theme } = useChat();
  const [selectedProduct, setSelectedProduct] = useState<CatalogItemData | null>(null);
  const [inquiryNote, setInquiryNote] = useState('');

  const profile = businessUser.businessProfile;
  const catalog = profile?.catalog || [];

  const handleSendOrder = (product: CatalogItemData) => {
    // Locate or create chat with this business
    const chat = createChat(businessUser.id);
    sendCatalogInquiry(
      chat.id,
      product,
      inquiryNote.trim() || `Hi, I want to purchase "${product.name}" ($${product.price}). Please share order details!`
    );
    setSelectedProduct(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg max-h-[88vh] rounded-2xl overflow-y-auto border shadow-2xl flex flex-col ${
          theme === 'dark'
            ? 'bg-[#111b21] border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Top Header */}
        <div
          className={`sticky top-0 z-20 px-5 py-3.5 flex items-center justify-between border-b ${
            theme === 'dark' ? 'bg-[#202c33] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Official Business Profile & Catalog</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Hero details */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-4">
            <img
              src={businessUser.avatar}
              alt={businessUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold truncate">{businessUser.name}</h2>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <span className="text-xs text-emerald-400 font-semibold block">
                {profile?.category || 'Verified Business Account'}
              </span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {profile?.description || businessUser.bio}
              </p>
            </div>
          </div>

          {/* Business Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
            {profile?.workingHours && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{profile.workingHours}</span>
              </div>
            )}
            {profile?.address && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">{profile.address}</span>
              </div>
            )}
            {profile?.email && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            )}
            {profile?.website && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate text-emerald-400">{profile.website}</span>
              </div>
            )}
          </div>

          {/* Product Catalog Section */}
          <div className="pt-3 border-t border-slate-800/60">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Product & Service Catalog ({catalog.length})
              </h4>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                Instant Inquiries Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catalog.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border overflow-hidden p-3 flex flex-col justify-between transition-all ${
                    theme === 'dark'
                      ? 'bg-[#182229] border-slate-800 hover:border-emerald-500/50'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg mb-2.5"
                  />
                  <div>
                    <h5 className="font-semibold text-xs text-white leading-tight mb-1">
                      {item.name}
                    </h5>
                    <div className="text-emerald-400 font-bold text-sm mb-1">
                      ${item.price} {item.currency}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(item)}
                    className="mt-3 w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Inquire / Order</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Inquiry Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-sm rounded-2xl p-5 border shadow-2xl ${
                theme === 'dark'
                  ? 'bg-[#182229] border-slate-700 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <h4 className="font-bold text-sm mb-2">Send Order Inquiry</h4>
              <p className="text-xs text-slate-400 mb-3">
                Send an official message to {businessUser.name} with this catalog item attached.
              </p>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-black/30 border border-slate-700 mb-3">
                <img
                  src={selectedProduct.imageUrl}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <div className="font-semibold text-xs">{selectedProduct.name}</div>
                  <div className="text-emerald-400 font-bold text-xs">
                    ${selectedProduct.price} {selectedProduct.currency}
                  </div>
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Add customized order notes, quantity or delivery address..."
                value={inquiryNote}
                onChange={(e) => setInquiryNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#111b21] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 mb-3"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleSendOrder(selectedProduct)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl"
                >
                  Send to Chat
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
