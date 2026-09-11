'use client'

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react'
import {
    ArrowLeft,
    ChevronDown,
    ChevronRight,
    FileText,
    Globe2,
    Loader2,
    Paperclip,
    Plus,
    Send,
    Settings2,
    Sparkles,
    Trash2,
    UserRound,
    X,
} from 'lucide-react'
import Link from 'next/link'
import { streamChat, type ChatMessage } from '@/lib/api'

/* ── Predefined starter questions ── */
const PROMPTS = [
    {
        title: 'Section 3(p) Risk Check',
        text: 'I have a herbal formulation using Turmeric, Neem, and Ashwagandha. Can you analyze the Section 3(p) patent rejection risk under the Indian Patents Act?',
    },
    {
        title: 'Product Classification',
        text: 'How do I classify my Ayurvedic product — is it a drug, Ayurveda-Aahar, cosmetic, or nutraceutical? What are the regulatory criteria for each?',
    },
    {
        title: 'NBA Biodiversity Clearance',
        text: 'My formulation uses biological resources sourced from India. Do I need NBA clearance under the Biological Diversity Act 2002? What forms are required?',
    },
    {
        title: 'AYUSH Licensing Guide',
        text: 'What licenses and GMP requirements do I need from the AYUSH Ministry to manufacture and sell a proprietary Ayurvedic medicine in India?',
    },
]

/* ── Language options ── */
const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'mr', label: 'मराठी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'or', label: 'ଓଡ଼ିଆ' },
]

/* ── Simple markdown-like renderer ── */
function RenderMarkdown({ text }: { text: string }) {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Headings
        if (line.startsWith('### ')) {
            elements.push(<h4 key={i} className="mt-4 mb-1.5 text-sm font-bold text-[#1a3a35]">{line.slice(4)}</h4>)
        } else if (line.startsWith('## ')) {
            elements.push(<h3 key={i} className="mt-5 mb-2 text-base font-bold text-[#111a31]">{line.slice(3)}</h3>)
        } else if (line.startsWith('# ')) {
            elements.push(<h2 key={i} className="mt-5 mb-2 text-lg font-extrabold text-[#111a31]">{line.slice(2)}</h2>)
        }
        // Bullet points
        else if (line.match(/^\s*[-*]\s/)) {
            elements.push(
                <div key={i} className="flex gap-2 py-0.5 pl-1">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#67988e]" />
                    <span className="text-[13px] leading-relaxed text-[#3f5d7d]">{renderInline(line.replace(/^\s*[-*]\s/, ''))}</span>
                </div>
            )
        }
        // Numbered lists
        else if (line.match(/^\s*\d+\.\s/)) {
            const match = line.match(/^\s*(\d+)\.\s(.*)/)
            if (match) {
                elements.push(
                    <div key={i} className="flex gap-2 py-0.5 pl-1">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e9f6e9] text-[10px] font-bold text-[#4f817b]">{match[1]}</span>
                        <span className="text-[13px] leading-relaxed text-[#3f5d7d]">{renderInline(match[2])}</span>
                    </div>
                )
            }
        }
        // Empty line → spacer
        else if (line.trim() === '') {
            elements.push(<div key={i} className="h-2" />)
        }
        // Normal paragraph
        else {
            elements.push(<p key={i} className="text-[13px] leading-relaxed text-[#3f5d7d]">{renderInline(line)}</p>)
        }
    }

    return <div>{elements}</div>
}

/* Inline bold/code rendering */
function renderInline(text: string): React.ReactNode {
    // Split by **bold** and `code` patterns
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-[#1a3a35]">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="rounded bg-[#e9f6e9] px-1 py-0.5 font-mono text-[11px] text-[#19745f]">{part.slice(1, -1)}</code>
        }
        return part
    })
}

/* ── Message type for the chat ── */
interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function Analyzer() {
    const [draft, setDraft] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [streaming, setStreaming] = useState(false)

    // Language selector
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0])
    const [langOpen, setLangOpen] = useState(false)

    // File attach
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [attachedFile, setAttachedFile] = useState<File | null>(null)

    // Auto-scroll
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async (text: string) => {
        const prompt = text.trim()
        if (!prompt || streaming) return

        const userMsg: Message = { role: 'user', content: prompt }
        const assistantMsg: Message = { role: 'assistant', content: '' }

        setMessages((prev) => [...prev, userMsg, assistantMsg])
        setDraft('')
        setStreaming(true)

        try {
            // Build chat history for context
            const chatHistory: ChatMessage[] = [
                ...messages.map((m) => ({ role: m.role, content: m.content })),
                { role: 'user' as const, content: prompt },
            ]

            let fullContent = ''
            for await (const chunk of streamChat(chatHistory)) {
                fullContent += chunk
                setMessages((prev) => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { role: 'assistant', content: fullContent }
                    return updated
                })
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to connect to LLM'
            setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: `⚠️ **Error:** ${errorMsg}\n\nMake sure Ollama is running locally with the Qwen3:30b model.\n\nRun: \`ollama serve\` and \`ollama run qwen3:30b\``,
                }
                return updated
            })
        } finally {
            setStreaming(false)
        }
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        sendMessage(draft)
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Only PDF files are allowed.')
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('File too large. Maximum size is 5MB.')
                return
            }
            setAttachedFile(file)
        }
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const clearChat = () => {
        setMessages([])
        setDraft('')
        setAttachedFile(null)
    }

    const hasMessages = messages.length > 0

    return (
        <div className="flex min-h-screen flex-col bg-[#f7faf8] text-[#15203a]">
            {/* ── Header ── */}
            <header className="flex h-[4.25rem] shrink-0 items-center justify-between border-b border-[#e5eceb] bg-white px-5 lg:px-8">
                <div className="flex items-center gap-3">
                    <Link href="/" aria-label="Back to home" className="text-[#73918e] transition-colors hover:text-[#15203a]"><ArrowLeft className="size-4" /></Link>
                    <div className="flex items-center gap-2 text-sm font-bold"><span className="flex size-8 items-center justify-center rounded-full bg-[#6e9a91] text-white"><Sparkles className="size-4" /></span>IP-SAKTI Sahayak</div>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-[#c4f0de] bg-[#f0fff8] px-3 py-1.5 text-[11px] font-semibold text-[#19745f] sm:flex"><span className="size-1.5 rounded-full bg-[#38c99a]" /> Qwen-32B <span className="font-normal text-[#50aa8d]">(Local Offline Engine)</span></div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-full border border-[#e3e9ed] bg-[#f8fafb] p-0.5 text-[10px] font-semibold">
                        <button className="rounded-full bg-white px-3 py-1.5 text-[#3f716a] shadow-sm">Domestic</button>
                        <button className="px-3 py-1.5 text-[#a2aebb]">Global</button>
                    </div>
                    <button className="hidden rounded-full border border-[#e3e9ed] px-3 py-2 text-xs font-semibold text-[#516379] sm:flex sm:items-center sm:gap-1.5"><FileText className="size-3.5" />Export PDF</button>
                    <button onClick={clearChat} aria-label="Clear chat" className="p-2 text-[#93a3b0] hover:text-red-500"><Trash2 className="size-4" /></button>
                    <button aria-label="Settings" className="p-2 text-[#93a3b0] hover:text-[#3f716a]"><Settings2 className="size-4" /></button>
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                {/* ── Sidebar ── */}
                <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e5eceb] bg-white lg:flex">
                    <button onClick={clearChat} className="mx-4 mt-5 flex items-center justify-center gap-2 rounded-full bg-[#67988e] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4f817b] transition-colors"><Plus className="size-4" /> New Analysis</button>
                    <div className="flex-1" />
                    <div className="border-t border-[#e5eceb] p-4">
                        <div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-full bg-[#f1f6f7] text-[#849aab]"><UserRound className="size-4" /></span><div><p className="text-[11px] font-bold text-[#294568]">Innovator workspace</p><p className="text-[10px] text-[#8da0af]">Local session</p></div></div>
                        <div className="mt-3 rounded-2xl border border-[#b9f1da] bg-[#effff7] p-3"><p className="text-[10px] font-bold text-[#248770]">Local Ollama Qwen-32B</p><p className="text-[10px] text-[#4caa8e]">Zero data leakage guarantee</p></div>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <main ref={scrollRef} className="relative min-w-0 flex-1 overflow-y-auto pb-36">
                    {!hasMessages ? (
                        /* ── Empty state: hero + prompt cards ── */
                        <div className="mx-auto max-w-4xl px-6 pb-12 pt-14 lg:px-12">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#4f817b]"><Sparkles className="size-4" /> Regulatory intelligence workspace</div>
                            <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#111a31] sm:text-5xl">What formulation, product, patent claim, or permission are we evaluating today?</h1>
                            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#71869c]">Ask Sahayak what to check, what you can sell, which patent route fits, or which permissions your formulation needs.</p>

                            <div className="mt-9 grid gap-3 sm:grid-cols-2">
                                {PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt.title}
                                        type="button"
                                        onClick={() => sendMessage(prompt.text)}
                                        disabled={streaming}
                                        className="group min-h-32 rounded-3xl border border-[#e1e9eb] bg-white p-5 text-left shadow-[0_4px_15px_rgba(27,65,74,0.05)] transition hover:border-[#9bd9c0] hover:shadow-md disabled:opacity-50"
                                    >
                                        <span className="flex size-7 items-center justify-center rounded-full bg-[#e9f6e9] text-[#6b9f8d]"><Sparkles className="size-4" /></span>
                                        <span className="mt-3 block text-[11px] font-bold uppercase tracking-wide text-[#67988e]">{prompt.title}</span>
                                        <span className="mt-1.5 block text-xs leading-relaxed text-[#3f5d7d]">{prompt.text}</span>
                                        <ChevronRight className="mt-3 size-4 text-[#b4c7d1] transition-transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ── Chat messages ── */
                        <div className="mx-auto max-w-4xl px-6 pt-8 lg:px-12">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`mb-6 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                                    {msg.role === 'user' ? (
                                        <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-[#67988e] px-5 py-3.5 text-sm leading-relaxed text-white shadow-sm">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e9f6e9] text-[#6b9f8d]">
                                                <Sparkles className="size-4" />
                                            </span>
                                            <div className="min-w-0 flex-1 rounded-3xl rounded-tl-lg border border-[#e1e9eb] bg-white px-5 py-4 shadow-[0_2px_12px_rgba(27,65,74,0.06)]">
                                                {msg.content ? (
                                                    <RenderMarkdown text={msg.content} />
                                                ) : (
                                                    <div className="flex items-center gap-2 py-1">
                                                        <Loader2 className="size-4 animate-spin text-[#67988e]" />
                                                        <span className="text-xs text-[#71869c]">Thinking…</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* Bottom padding for chat */}
                            <div className="h-8" />
                        </div>
                    )}

                    {/* ── Bottom input bar ── */}
                    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center bg-white/90 px-4 pb-4 pt-3 backdrop-blur-md lg:left-64">
                        <form
                            className="pointer-events-auto w-full max-w-3xl rounded-3xl border border-[#d8e4e8] bg-white px-3 py-2 shadow-[0_8px_30px_rgba(44,75,88,0.1)]"
                            onSubmit={handleSubmit}
                        >
                            {/* Attached file badge */}
                            {attachedFile && (
                                <div className="mb-2 flex items-center gap-2 rounded-xl bg-[#f0f5f4] px-3 py-1.5">
                                    <FileText className="size-3.5 text-[#67988e]" />
                                    <span className="flex-1 truncate text-xs font-medium text-[#294568]">{attachedFile.name}</span>
                                    <span className="text-[10px] text-[#8da0af]">{(attachedFile.size / 1024).toFixed(0)} KB</span>
                                    <button type="button" onClick={() => setAttachedFile(null)} className="text-[#93a3b0] hover:text-red-500"><X className="size-3.5" /></button>
                                </div>
                            )}

                            <input
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Type a formulation, product, patent claim, or permission question..."
                                className="w-full bg-transparent px-2 py-1 text-sm text-[#294568] outline-none placeholder:text-[#9aadc1]"
                                disabled={streaming}
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[#8da4b4]">
                                    {/* File attach */}
                                    <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                                    <button type="button" aria-label="Attach PDF" onClick={() => fileInputRef.current?.click()} className="transition-colors hover:text-[#67988e]">
                                        <Paperclip className="size-4" />
                                    </button>

                                    {/* Language selector */}
                                    <div className="relative">
                                        <button type="button" onClick={() => setLangOpen((v) => !v)} className="flex items-center gap-1 text-[10px] font-semibold transition-colors hover:text-[#67988e]">
                                            <Globe2 className="size-3.5" />
                                            {selectedLang.label}
                                            <ChevronDown className={`size-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {langOpen && (
                                            <>
                                                <div className="fixed inset-0 z-20" onClick={() => setLangOpen(false)} />
                                                <div className="absolute bottom-full left-0 z-30 mb-2 max-h-56 w-36 overflow-y-auto rounded-xl border border-[#e1e9eb] bg-white py-1 shadow-lg">
                                                    {LANGUAGES.map((lang) => (
                                                        <button key={lang.code} type="button" onClick={() => { setSelectedLang(lang); setLangOpen(false) }}
                                                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-[#f0f5f4] ${selectedLang.code === lang.code ? 'font-bold text-[#19745f] bg-[#f0fff8]' : 'text-[#3f5d7d]'}`}
                                                        >
                                                            {lang.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={(!draft.trim() && !attachedFile) || streaming}
                                    className="flex items-center gap-1.5 rounded-full bg-[#c7d9d6] px-4 py-2 text-xs font-semibold text-white transition enabled:bg-[#67988e] enabled:hover:bg-[#4f817b]"
                                >
                                    {streaming ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                                    {streaming ? 'Thinking…' : 'Analyze'}
                                </button>
                            </div>
                        </form>
                        <p className="absolute bottom-1 hidden text-[9px] text-[#99aeb7] lg:block">Local analysis workspace · Verify statutory conclusions with a qualified professional.</p>
                    </div>
                </main>
            </div>
        </div>
    )
}
