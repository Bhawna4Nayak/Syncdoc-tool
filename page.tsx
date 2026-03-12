'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface ChatMessage {
  user: string;
  msg: string;
}

export default function Workspace() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [content, setContent] = useState('<h1>SyncDoc Workspace</h1>');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Mark as client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    });
    
    setSocket(newSocket);
    newSocket.emit('join_doc', 'doc-1');

    newSocket.on('doc_updated', (data: any) => {
      setContent(data.content);
    });

    newSocket.on('chat_message', (data: any) => {
      setChat(prev => [...prev, { user: data.user, msg: data.message }]);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setLoading(false);
    });

    newSocket.on('connect', () => {
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Editor Setup - FIXED with immediatelyRender: false
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,  // ← THIS FIXES THE ERROR
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      if (socket) {
        socket.emit('update_doc', { docId: 'doc-1', content: html });
      }
    },
  });

  // AI Summarize
  const handleAI = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/summarize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-user-role': role 
        },
        body: JSON.stringify({ content: editor?.getText() || '' })
      });
      const data = await res.json();
      setChat(prev => [...prev, { user: 'AI', msg: data.summary || 'Summary generated' }]);
    } catch (error) {
      console.error('AI Error:', error);
      setChat(prev => [...prev, { user: 'AI', msg: 'AI service unavailable' }]);
    }
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as any).elements[0];
    const message = input.value;
    if (socket && message) {
      socket.emit('chat_message', { docId: 'doc-1', message, user: 'You' });
      input.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl">Loading Workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-4">SyncDoc</h1>
        <p className="text-sm text-gray-500">Role: {role}</p>
        <button 
          onClick={handleAI}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          ✨ AI Summarize
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white p-8 rounded shadow min-h-[500px]">
          {isClient && editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="text-gray-500">Editor loading...</div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="w-80 bg-white border-l p-4 flex flex-col">
        <h2 className="font-bold mb-4">Team Chat</h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {chat.length === 0 ? (
            <div className="text-sm text-gray-400 text-center">No messages yet</div>
          ) : (
            chat.map((c, i) => (
              <div key={i} className="text-sm p-2 bg-gray-100 rounded">
                <span className="font-bold">{c.user}:</span> {c.msg}
              </div>
            ))
          )}
        </div>
        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <input 
            className="border p-2 w-full rounded" 
            placeholder="Type a message..." 
          />
          <button 
            type="submit" 
            className="bg-green-500 text-white px-4 rounded hover:bg-green-600 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}