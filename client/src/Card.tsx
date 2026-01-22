import React, { useState } from "react";
import { Reply, Send, X } from "lucide-react"; 

interface Calculation {
  id: number;
  createdAt: string;
  operation: string | null;
  value: number;
  result: number;
  author: { username: string };
  _count?: { children: number };
}

interface Props {
  data: Calculation;
  depth?: number;
  onReply: (id: number) => void;
  isReplying: boolean;
  onCancelReply: () => void;
  onSubmitReply: (parentId: number, op: string, val: string) => void;
  canReply: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", " at");
};

const Card: React.FC<Props> = ({ 
  data, onReply, depth = 0, 
  isReplying, onCancelReply, onSubmitReply, canReply 
}) => {
  const avatar =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  const [replyVal, setReplyVal] = useState("");
  const [replyOp, setReplyOp] = useState("+");

  const handleSubmit = () => {
    if(!replyVal) return;
    onSubmitReply(data.id, replyOp, replyVal);
    setReplyVal("");
  };

  return (
    <div className="relative flex gap-4" style={{ marginLeft: depth * 32 }}>
      {depth > 0 && (
        <div className="absolute left-[-16px] top-0 bottom-0 w-px bg-gray-200" />
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center w-14 shrink-0">
        <img
          src={avatar}
          alt={data.author.username}
          className="w-10 h-10 rounded-md object-cover shadow-sm"
        />
      </div>

      {/* Comment body */}
      <div className="flex-1 mb-6">
        <div className="text-xs text-gray-500 mb-1">
          <span className="font-medium text-gray-700">
            {data.author.username}
          </span>{" "}
          • {formatDate(data.createdAt)}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-800 mb-3">
            {depth === 0 ? (
              <div className="text-base">
                <span className="font-bold text-blue-600">{data.result}</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {/* <span className="text-gray-400">Previous</span> */}
                <span className="font-bold text-purple-600">
                  {data.operation}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                  {data.value}
                </span>
                <span className="text-gray-400">=</span>
                <span className="font-bold text-green-600">{data.result}</span>
              </div>
            )}
          </div>

          {/* Reply Section */}
          {!isReplying ? (
            <button
              onClick={() => canReply ? onReply(data.id) : alert("Please log in")}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
            >
              <Reply size={14} className="scale-x-[-1]" />
              Reply
              {data._count?.children ? (
                <span className="text-gray-400">({data._count.children})</span>
              ) : null}
            </button>
          ) : (
            // --- NEW: Input Form inside the design ---
            <div className="mt-4 flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
               <select 
                 className="bg-white border rounded px-1 py-1 text-sm"
                 value={replyOp}
                 onChange={(e) => setReplyOp(e.target.value)}
               >
                 <option value="+">+</option>
                 <option value="-">-</option>
                 <option value="*">*</option>
                 <option value="/">/</option>
               </select>

               <input 
                 autoFocus
                 type="number"
                 placeholder="Num"
                 className="w-20 border rounded px-2 py-1 text-sm"
                 value={replyVal}
                 onChange={(e) => setReplyVal(e.target.value)}
               />

               <button 
                 onClick={handleSubmit}
                 className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
               >
                 <Send size={14}/>
               </button>
               
               <button 
                 onClick={onCancelReply}
                 className="text-gray-400 hover:text-red-500"
               >
                 <X size={14}/>
               </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Card;