import { useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";
import "./App.css";
import { User, X, Check } from "lucide-react"; 

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

interface Calculation {
  id: number;
  parentId: number | null;
  createdAt: string;
  operation: string | null;
  value: number;
  result: number;
  author: { username: string };
  _count?: { children: number };
}

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [posts, setPosts] = useState<Calculation[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(
    localStorage.getItem("username"),
  );

  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPostValue, setNewPostValue] = useState("");

  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/post");
      setPosts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", {
        username,
        password,
      });

      setToken(res.data.token);

      localStorage.setItem("username", res.data.username);
      localStorage.setItem("token", res.data.token);
      setLoggedInUsername(res.data.username); // Fix update
      alert("Logged in!");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/signup", {
        username,
        password,
      });
      setUsername("");
      setPassword("");
      alert("Register Success");
    } catch (err) {
      console.error(err);
      alert("Username taken");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

const handleCreateRoot = async () => {
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    try {
      await API.post("/post", { value: newPostValue });
      
      setNewPostValue("");
      setIsCreating(false);
      fetchPosts();
    } catch (error) {
      console.error(error);
      alert("Error creating post");
    }
  };

  const handleSubmitReply = async (parentId: number, operation: string, value: string) => {
    if (!token) {
      alert("You must be logged in to reply.");
      return;
    }

    try {
      await API.post("/post/reply", { 
        parentId: parentId, 
        operation: operation, 
        value: value 
      });

      setActiveReplyId(null);
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const buildTree = (items: Calculation[]) => {
    const map = new Map<number, Calculation & { children: Calculation[] }>();
    const roots: (Calculation & { children: Calculation[] })[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      if (item.parentId === null) {
        roots.push(map.get(item.id)!);
      } else {
        map.get(item.parentId)?.children.push(map.get(item.id)!);
      }
    });

    return roots;
  };

  const renderNode = (
    node: Calculation & { children: Calculation[] },
    depth = 0,
  ) => {
    return (
      <div key={node.id}>
        <Card
          data={node}
          depth={depth}
          // Pass logic to Card
          onReply={(id) => setActiveReplyId(id)}
          isReplying={activeReplyId === node.id}
          onCancelReply={() => setActiveReplyId(null)}
          onSubmitReply={handleSubmitReply}
          canReply={!!token} 
        />

        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight ">
          <span>Math Social Network</span>
        </h1>
        {token ? (
          <div className="flex items-center justify-around w-40">
            <div className="flex items-center justify-center">
              <User />
              <span>{loggedInUsername}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Guest Mode</span>
        )}
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        {!token && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-blue-100">
            <h2 className="text-lg font-bold mb-4">Login to Participate</h2>
            <div className="flex gap-2">
              <input
                placeholder="Username"
                className="border p-2 rounded w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700"
                onClick={handleLogin}
              >
                Login
              </button>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700"
                onClick={handleSignup}
              >
                Register
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          
          {token && (
            isCreating ? (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <input 
                  type="number" 
                  autoFocus
                  placeholder="Enter start number" 
                  className="border border-black rounded px-3 py-2 w-40"
                  value={newPostValue}
                  onChange={(e) => setNewPostValue(e.target.value)}
                />
                <button onClick={handleCreateRoot} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                  <Check size={18} />
                </button>
                <button onClick={() => setIsCreating(false)} className="bg-gray-200 text-gray-600 p-2 rounded hover:bg-gray-300">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800"
              >
                + Start New Number
              </button>
            )
          )}
        </div>

        <div className="space-y-4">
          {buildTree(posts).map((root) => renderNode(root))}

          {posts.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              No math yet. Be the first to start a chain!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;