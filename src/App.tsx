import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Section = "chats" | "groups" | "contacts" | "notifications" | "settings" | "profile";

interface Message {
  id: number;
  text: string;
  time: string;
  mine: boolean;
  type?: "text" | "voice" | "image";
  duration?: string;
  read?: boolean;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread?: number;
  online?: boolean;
  isGroup?: boolean;
  members?: number;
  encrypted?: boolean;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  avatar: string;
  online?: boolean;
  phone?: string;
}

interface NotificationItem {
  id: number;
  title: string;
  text: string;
  time: string;
  read: boolean;
  icon: string;
}

const CHATS: Chat[] = [
  { id: 1, name: "Алексей Петров", avatar: "АП", lastMsg: "Документы отправил", time: "14:32", unread: 2, online: true, encrypted: true },
  { id: 2, name: "Общий отдел", avatar: "ОО", lastMsg: "Совещание в 15:00", time: "13:15", unread: 5, isGroup: true, members: 12, encrypted: true },
  { id: 3, name: "Мария Иванова", avatar: "МИ", lastMsg: "Хорошо, принято!", time: "12:48", online: false, encrypted: true },
  { id: 4, name: "IT отдел", avatar: "IT", lastMsg: "Сервер обновлён", time: "11:20", isGroup: true, members: 8, encrypted: true },
  { id: 5, name: "Дмитрий Соколов", avatar: "ДС", lastMsg: "Перезвоню позже", time: "10:05", online: true, encrypted: true },
  { id: 6, name: "Руководство", avatar: "РК", lastMsg: "Отчёт принят", time: "Вчера", isGroup: true, members: 4, encrypted: true },
  { id: 7, name: "Светлана Новикова", avatar: "СН", lastMsg: "Файл получила", time: "Вчера", online: false, encrypted: true },
];

const MESSAGES: Message[] = [
  { id: 1, text: "Доброе утро! Нужно обсудить проект.", time: "09:15", mine: false, read: true },
  { id: 2, text: "Добрый! Да, готов. Когда удобно?", time: "09:17", mine: true, read: true },
  { id: 3, text: "voice", time: "09:20", mine: false, type: "voice", duration: "0:24", read: true },
  { id: 4, text: "Давай в 11:00 в переговорной", time: "09:22", mine: true, read: true },
  { id: 5, text: "Отлично, договорились! Буду там.", time: "09:23", mine: false, read: true },
  { id: 6, text: "Документы отправил на почту", time: "14:32", mine: false, read: false },
];

const CONTACTS: Contact[] = [
  { id: 1, name: "Алексей Петров", role: "Руководитель проекта", avatar: "АП", online: true, phone: "+7 999 123-45-67" },
  { id: 2, name: "Мария Иванова", role: "Аналитик", avatar: "МИ", online: false, phone: "+7 999 234-56-78" },
  { id: 3, name: "Дмитрий Соколов", role: "Разработчик", avatar: "ДС", online: true, phone: "+7 999 345-67-89" },
  { id: 4, name: "Светлана Новикова", role: "Дизайнер", avatar: "СН", online: false, phone: "+7 999 456-78-90" },
  { id: 5, name: "Игорь Васильев", role: "Тестировщик", avatar: "ИВ", online: true, phone: "+7 999 567-89-01" },
  { id: 6, name: "Анна Кузнецова", role: "Менеджер", avatar: "АК", online: false, phone: "+7 999 678-90-12" },
];

const NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: "Новое сообщение", text: "Алексей Петров: Документы отправил", time: "14:32", read: false, icon: "MessageCircle" },
  { id: 2, title: "Упоминание в группе", text: "Общий отдел: @вы Совещание в 15:00", time: "13:15", read: false, icon: "Bell" },
  { id: 3, title: "Новый участник", text: "Анна Кузнецова добавлена в IT отдел", time: "11:00", read: true, icon: "UserPlus" },
  { id: 4, title: "Системное уведомление", text: "Синхронизация завершена успешно", time: "10:30", read: true, icon: "RefreshCw" },
  { id: 5, title: "Новое сообщение", text: "IT отдел: Сервер обновлён", time: "09:00", read: true, icon: "MessageCircle" },
];

const GROUPS: Chat[] = [
  { id: 2, name: "Общий отдел", avatar: "ОО", lastMsg: "Совещание в 15:00", time: "13:15", unread: 5, isGroup: true, members: 12, encrypted: true },
  { id: 4, name: "IT отдел", avatar: "IT", lastMsg: "Сервер обновлён", time: "11:20", isGroup: true, members: 8, encrypted: true },
  { id: 6, name: "Руководство", avatar: "РК", lastMsg: "Отчёт принят", time: "Вчера", isGroup: true, members: 4, encrypted: true },
];

const avatarColor = (str: string) => {
  const colors = ["#2C7A7B", "#2B6CB0", "#744210", "#553C9A", "#276749", "#C05621", "#702459"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg: Message = {
      id: messages.length + 1,
      text: inputText,
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      mine: true,
      read: false,
    };
    setMessages([...messages, msg]);
    setInputText("");
  };

  const filteredChats = CHATS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = CHATS.reduce((acc, c) => acc + (c.unread || 0), 0);
  const unreadNotifs = NOTIFICATIONS.filter(n => !n.read).length;

  const navItems: { id: Section; icon: string; label: string; badge?: number }[] = [
    { id: "chats", icon: "MessageCircle", label: "Чаты", badge: totalUnread },
    { id: "groups", icon: "Users", label: "Группы" },
    { id: "contacts", icon: "BookUser", label: "Контакты" },
    { id: "notifications", icon: "Bell", label: "Уведомления", badge: unreadNotifs },
    { id: "settings", icon: "Settings", label: "Настройки" },
    { id: "profile", icon: "UserCircle", label: "Профиль" },
  ];

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-golos overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Navigation */}
      <aside
        className={`
          fixed md:relative z-40 md:z-auto
          flex flex-col w-64 h-full bg-white border-r border-[#EAECF0]
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="px-6 py-5 border-b border-[#EAECF0]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A73E8] rounded-lg flex items-center justify-center">
              <Icon name="MessageSquare" size={16} className="text-white" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#1A1A2E] leading-tight">Корпоративный</div>
              <div className="text-[11px] text-[#8A8FA8] leading-tight">чат</div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-[#EAECF0]">
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B7C9]" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#F7F8FA] rounded-lg text-[13px] text-[#1A1A2E] placeholder:text-[#B0B7C9] outline-none border border-transparent focus:border-[#1A73E8]/30 transition-all"
            />
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setActiveChat(null); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                ${activeSection === item.id
                  ? "bg-[#EBF3FE] text-[#1A73E8]"
                  : "text-[#5C6280] hover:bg-[#F7F8FA]"
                }
              `}
            >
              <Icon name={item.icon} size={18} />
              <span className="text-[13.5px] font-medium flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="min-w-[18px] h-[18px] px-1 bg-[#1A73E8] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#EAECF0]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: avatarColor("ВА") }}
            >
              ВА
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-[#1A1A2E] truncate">Вы</div>
              <div className="text-[11px] text-[#22C55E]">● онлайн</div>
            </div>
            <button className="p-1.5 hover:bg-[#F7F8FA] rounded-lg transition-colors">
              <Icon name="LogOut" size={14} className="text-[#B0B7C9]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {activeSection === "chats" || activeSection === "groups" ? (
          <>
            {/* Chat List */}
            <div className={`
              flex flex-col w-full md:w-80 bg-white border-r border-[#EAECF0] flex-shrink-0
              ${activeChat ? "hidden md:flex" : "flex"}
            `}>
              <div className="px-5 py-4 border-b border-[#EAECF0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="md:hidden p-1.5 hover:bg-[#F7F8FA] rounded-lg"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Icon name="Menu" size={18} className="text-[#5C6280]" />
                  </button>
                  <h2 className="text-[15px] font-semibold text-[#1A1A2E]">
                    {activeSection === "groups" ? "Группы" : "Сообщения"}
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-[#F7F8FA] rounded-xl transition-colors">
                    <Icon name="PenSquare" size={16} className="text-[#5C6280]" />
                  </button>
                  {activeSection === "groups" && (
                    <button className="p-2 hover:bg-[#F7F8FA] rounded-xl transition-colors">
                      <Icon name="Plus" size={16} className="text-[#5C6280]" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {(activeSection === "groups" ? GROUPS : filteredChats).map((chat, idx) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    className={`
                      w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F7F8FA] transition-all border-b border-[#F0F1F5] text-left
                      ${activeChat?.id === chat.id ? "bg-[#EBF3FE]" : ""}
                    `}
                    style={{ animation: `fadeIn 0.3s ease ${idx * 40}ms both` }}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                        style={{ background: avatarColor(chat.avatar) }}
                      >
                        {chat.isGroup ? <Icon name="Users" size={16} className="text-white" /> : chat.avatar}
                      </div>
                      {chat.online && !chat.isGroup && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13.5px] font-semibold text-[#1A1A2E] truncate">{chat.name}</span>
                          {chat.encrypted && <Icon name="Lock" size={10} className="text-[#B0B7C9] flex-shrink-0" />}
                        </div>
                        <span className="text-[11px] text-[#B0B7C9] flex-shrink-0">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[12px] text-[#8A8FA8] truncate">{chat.lastMsg}</span>
                        {chat.unread ? (
                          <span className="ml-2 min-w-[18px] h-[18px] px-1 bg-[#1A73E8] text-white text-[10px] font-semibold rounded-full flex items-center justify-center flex-shrink-0">
                            {chat.unread}
                          </span>
                        ) : null}
                      </div>
                      {chat.isGroup && (
                        <div className="text-[11px] text-[#B0B7C9] mt-0.5">{chat.members} участников</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col min-w-0 ${!activeChat ? "hidden md:flex items-center justify-center bg-[#F7F8FA]" : "flex"}`}>
              {!activeChat ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#EBF3FE] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="MessageCircle" size={28} className="text-[#1A73E8]" />
                  </div>
                  <p className="text-[15px] font-medium text-[#5C6280]">Выберите чат</p>
                  <p className="text-[13px] text-[#B0B7C9] mt-1">для начала общения</p>
                </div>
              ) : (
                <>
                  <div className="bg-white border-b border-[#EAECF0] px-5 py-3.5 flex items-center gap-3">
                    <button
                      className="md:hidden p-1.5 hover:bg-[#F7F8FA] rounded-lg mr-1"
                      onClick={() => setActiveChat(null)}
                    >
                      <Icon name="ArrowLeft" size={18} className="text-[#5C6280]" />
                    </button>
                    <div className="relative">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                        style={{ background: avatarColor(activeChat.avatar) }}
                      >
                        {activeChat.isGroup ? <Icon name="Users" size={14} className="text-white" /> : activeChat.avatar}
                      </div>
                      {activeChat.online && !activeChat.isGroup && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#22C55E] rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-semibold text-[#1A1A2E]">{activeChat.name}</span>
                        <Icon name="Lock" size={11} className="text-[#B0B7C9]" />
                      </div>
                      <div className="text-[11px] text-[#8A8FA8]">
                        {activeChat.isGroup
                          ? `${activeChat.members} участников`
                          : activeChat.online ? "онлайн" : "был(а) недавно"
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 hover:bg-[#F7F8FA] rounded-xl transition-colors">
                        <Icon name="Phone" size={16} className="text-[#5C6280]" />
                      </button>
                      <button className="p-2 hover:bg-[#F7F8FA] rounded-xl transition-colors">
                        <Icon name="MoreVertical" size={16} className="text-[#5C6280]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center pt-3 pb-1">
                    <div className="flex items-center gap-1.5 bg-[#F0FDF4] text-[#15803D] text-[11px] px-3 py-1 rounded-full">
                      <Icon name="ShieldCheck" size={11} />
                      <span>Сквозное шифрование включено</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                    {messages.map((msg, idx) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
                        style={{ animation: `fadeIn 0.25s ease ${idx * 25}ms both` }}
                      >
                        <div className={`
                          max-w-[70%] rounded-2xl px-4 py-2.5
                          ${msg.mine
                            ? "bg-[#1A73E8] text-white rounded-br-sm"
                            : "bg-white text-[#1A1A2E] rounded-bl-sm border border-[#EAECF0]"
                          }
                        `}>
                          {msg.type === "voice" ? (
                            <div className="flex items-center gap-3 min-w-[160px]">
                              <button className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.mine ? "bg-white/20" : "bg-[#EBF3FE]"}`}>
                                <Icon name="Play" size={12} className={msg.mine ? "text-white" : "text-[#1A73E8]"} />
                              </button>
                              <div className="flex-1">
                                <div className="flex gap-0.5 items-end h-5">
                                  {[3, 5, 8, 4, 7, 5, 9, 6, 4, 7, 5, 8, 3, 6, 4].map((h, i) => (
                                    <div
                                      key={i}
                                      className={`w-0.5 rounded-full flex-shrink-0 ${msg.mine ? "bg-white/60" : "bg-[#1A73E8]/40"}`}
                                      style={{ height: `${h * 2}px` }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className={`text-[11px] ${msg.mine ? "text-white/70" : "text-[#8A8FA8]"}`}>{msg.duration}</span>
                            </div>
                          ) : (
                            <p className="text-[13.5px] leading-relaxed">{msg.text}</p>
                          )}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-[10px] ${msg.mine ? "text-white/60" : "text-[#B0B7C9]"}`}>{msg.time}</span>
                            {msg.mine && (
                              <Icon
                                name={msg.read ? "CheckCheck" : "Check"}
                                size={12}
                                className={msg.read ? "text-white/80" : "text-white/50"}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="bg-white border-t border-[#EAECF0] px-4 py-3">
                    <div className="flex items-end gap-2">
                      <button className="p-2 hover:bg-[#F7F8FA] rounded-xl transition-colors flex-shrink-0">
                        <Icon name="Paperclip" size={18} className="text-[#8A8FA8]" />
                      </button>
                      <div className="flex-1 bg-[#F7F8FA] rounded-2xl px-4 py-2.5 flex items-end gap-2 border border-transparent focus-within:border-[#1A73E8]/30 transition-all">
                        <textarea
                          value={inputText}
                          onChange={e => setInputText(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                          placeholder="Написать сообщение..."
                          rows={1}
                          className="flex-1 bg-transparent text-[13.5px] text-[#1A1A2E] placeholder:text-[#B0B7C9] outline-none resize-none max-h-28 font-golos"
                        />
                        <button className="p-1 hover:opacity-70 transition-opacity flex-shrink-0">
                          <Icon name="Smile" size={18} className="text-[#8A8FA8]" />
                        </button>
                      </div>
                      {inputText.trim() ? (
                        <button
                          onClick={sendMessage}
                          className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center hover:bg-[#1557B0] transition-colors flex-shrink-0"
                        >
                          <Icon name="Send" size={16} className="text-white" />
                        </button>
                      ) : (
                        <button className="w-10 h-10 bg-[#F7F8FA] rounded-full flex items-center justify-center hover:bg-[#EAECF0] transition-colors flex-shrink-0">
                          <Icon name="Mic" size={16} className="text-[#5C6280]" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : activeSection === "contacts" ? (
          <ContactsSection contacts={CONTACTS} onChat={(c) => { setActiveSection("chats"); setActiveChat({ id: c.id, name: c.name, avatar: c.avatar, lastMsg: "", time: "", encrypted: true, online: c.online }); }} />
        ) : activeSection === "notifications" ? (
          <NotificationsSection notifications={NOTIFICATIONS} />
        ) : activeSection === "settings" ? (
          <SettingsSection />
        ) : activeSection === "profile" ? (
          <ProfileSection />
        ) : null}
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAECF0] flex md:hidden z-20 pb-safe">
        {navItems.slice(0, 5).map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveSection(item.id); setActiveChat(null); }}
            className={`flex-1 flex flex-col items-center py-2.5 gap-1 relative ${activeSection === item.id ? "text-[#1A73E8]" : "text-[#B0B7C9]"}`}
          >
            <Icon name={item.icon} size={20} />
            <span className="text-[9px] font-medium">{item.label}</span>
            {item.badge ? (
              <div className="absolute top-1.5 right-[calc(50%-14px)] w-[14px] h-[14px] bg-[#1A73E8] rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                {item.badge > 9 ? "9+" : item.badge}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ContactsSection({ contacts, onChat }: { contacts: Contact[]; onChat: (c: Contact) => void }) {
  const [search, setSearch] = useState("");
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">
      <div className="bg-white border-b border-[#EAECF0] px-6 py-4">
        <h2 className="text-[15px] font-semibold text-[#1A1A2E] mb-3">Контакты</h2>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B7C9]" />
          <input
            type="text"
            placeholder="Поиск контактов..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs pl-8 pr-3 py-2 bg-[#F7F8FA] rounded-lg text-[13px] outline-none border border-transparent focus:border-[#1A73E8]/30 transition-all font-golos"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-2 max-w-2xl">
          {filtered.map((c, idx) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 border border-[#EAECF0] hover:border-[#1A73E8]/30 transition-all"
              style={{ animation: `fadeIn 0.3s ease ${idx * 40}ms both` }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                  style={{ background: avatarColor(c.avatar) }}
                >
                  {c.avatar}
                </div>
                {c.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-[#1A1A2E]">{c.name}</div>
                <div className="text-[12px] text-[#8A8FA8]">{c.role}</div>
                {c.phone && <div className="text-[11px] text-[#B0B7C9] mt-0.5">{c.phone}</div>}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onChat(c)}
                  className="p-2 bg-[#EBF3FE] hover:bg-[#1A73E8] group rounded-xl transition-all"
                >
                  <Icon name="MessageCircle" size={15} className="text-[#1A73E8] group-hover:text-white transition-colors" />
                </button>
                <button className="p-2 bg-[#F7F8FA] hover:bg-[#EAECF0] rounded-xl transition-all">
                  <Icon name="Phone" size={15} className="text-[#5C6280]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">
      <div className="bg-white border-b border-[#EAECF0] px-6 py-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1A1A2E]">Уведомления</h2>
        <button className="text-[12px] text-[#1A73E8] hover:underline">Прочитать все</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2 max-w-xl">
          {notifications.map((n, idx) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl px-5 py-4 flex items-start gap-4 border transition-all ${n.read ? "border-[#EAECF0]" : "border-[#1A73E8]/20"}`}
              style={{ animation: `fadeIn 0.3s ease ${idx * 40}ms both` }}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? "bg-[#F7F8FA]" : "bg-[#EBF3FE]"}`}>
                <Icon name={n.icon} size={16} className={n.read ? "text-[#B0B7C9]" : "text-[#1A73E8]"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-semibold ${n.read ? "text-[#5C6280]" : "text-[#1A1A2E]"}`}>{n.title}</span>
                  <span className="text-[11px] text-[#B0B7C9]">{n.time}</span>
                </div>
                <p className="text-[12px] text-[#8A8FA8] mt-0.5 truncate">{n.text}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 bg-[#1A73E8] rounded-full mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  const settings = [
    { group: "Аккаунт", items: [
      { icon: "User", label: "Личные данные", desc: "Имя, фото, должность" },
      { icon: "Lock", label: "Конфиденциальность", desc: "Кто видит мой статус" },
      { icon: "Shield", label: "Безопасность", desc: "Двухфакторная аутентификация" },
    ]},
    { group: "Уведомления", items: [
      { icon: "Bell", label: "Push-уведомления", desc: "Новые сообщения и события" },
      { icon: "Volume2", label: "Звуки", desc: "Звуки входящих сообщений" },
    ]},
    { group: "Данные", items: [
      { icon: "RefreshCw", label: "Синхронизация", desc: "Автоматическая, включена" },
      { icon: "HardDrive", label: "Хранилище", desc: "Медиафайлы и документы" },
    ]},
    { group: "Внешний вид", items: [
      { icon: "Palette", label: "Тема", desc: "Светлая" },
      { icon: "Languages", label: "Язык", desc: "Русский" },
    ]},
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">
      <div className="bg-white border-b border-[#EAECF0] px-6 py-4">
        <h2 className="text-[15px] font-semibold text-[#1A1A2E]">Настройки</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 max-w-xl">
          {settings.map((group, gi) => (
            <div key={gi} style={{ animation: `fadeIn 0.3s ease ${gi * 60}ms both` }}>
              <div className="text-[11px] font-semibold text-[#B0B7C9] uppercase tracking-wider px-1 mb-2">{group.group}</div>
              <div className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden">
                {group.items.map((item, ii) => (
                  <button
                    key={ii}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#F7F8FA] transition-colors border-b border-[#F0F1F5] last:border-0 text-left"
                  >
                    <div className="w-8 h-8 bg-[#EBF3FE] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name={item.icon} size={15} className="text-[#1A73E8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium text-[#1A1A2E]">{item.label}</div>
                      <div className="text-[11px] text-[#8A8FA8]">{item.desc}</div>
                    </div>
                    <Icon name="ChevronRight" size={15} className="text-[#B0B7C9] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">
      <div className="bg-white border-b border-[#EAECF0] px-6 py-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1A1A2E]">Профиль</h2>
        <button className="text-[12px] text-[#1A73E8] hover:underline font-medium">Изменить</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-xl space-y-4">
          <div className="bg-white rounded-2xl border border-[#EAECF0] p-6 flex flex-col items-center text-center" style={{ animation: "fadeIn 0.3s ease both" }}>
            <div className="relative mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: avatarColor("ВА") }}
              >
                ВА
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#1A73E8] rounded-full flex items-center justify-center border-2 border-white">
                <Icon name="Camera" size={12} className="text-white" />
              </button>
            </div>
            <div className="text-[17px] font-bold text-[#1A1A2E]">Ваше Имя</div>
            <div className="text-[13px] text-[#8A8FA8] mt-1">Сотрудник организации</div>
            <div className="flex items-center gap-1.5 mt-2 text-[#22C55E] text-[12px]">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
              Онлайн
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden" style={{ animation: "fadeIn 0.3s ease 80ms both" }}>
            {[
              { icon: "Phone", label: "Телефон", value: "+7 999 000-00-00" },
              { icon: "Mail", label: "Email", value: "user@company.ru" },
              { icon: "Building2", label: "Отдел", value: "Основной отдел" },
              { icon: "MapPin", label: "Офис", value: "Москва, Центральный" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F0F1F5] last:border-0">
                <div className="w-8 h-8 bg-[#F7F8FA] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={row.icon} size={14} className="text-[#5C6280]" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-[#B0B7C9]">{row.label}</div>
                  <div className="text-[13.5px] font-medium text-[#1A1A2E]">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3" style={{ animation: "fadeIn 0.3s ease 120ms both" }}>
            {[
              { label: "Чатов", value: "7" },
              { label: "Групп", value: "3" },
              { label: "Контактов", value: "6" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EAECF0] p-4 text-center">
                <div className="text-[22px] font-bold text-[#1A73E8]">{s.value}</div>
                <div className="text-[11px] text-[#8A8FA8] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
