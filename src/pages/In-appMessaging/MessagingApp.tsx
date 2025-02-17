import { useState } from "react";
import { MoreHorizontalIcon, Search } from "lucide-react";
import { Box, Button, Typography, TextField, Card, Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from '@mui/icons-material/Delete';

const MessagingApp = () => {
  const [activeChat, setActiveChat] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState("all");
  interface Conversations {
    [key: string]: Message[];
  }

  const [conversations, setConversations] = useState<Conversations>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  interface Message {
    id: number;
    text: string;
    sender: string;
    timestamp: string;
    read: boolean;
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const startNewConversation = () => {
    const newUser = `Person ${Object.keys(conversations).length + 1}`;
    setConversations({ ...conversations, [newUser]: [] });
    setCurrentUser(newUser);
    setActiveChat(true);
  };

  const deleteConversation = (user: string) => {
    const updatedConversations = { ...conversations };
    delete updatedConversations[user];
    setConversations(updatedConversations);
    if (currentUser === user) {
      setCurrentUser(null);
      setActiveChat(false);
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() === "" || messageInput.length > 500 || !currentUser) return;
    
    const newMessage: Message = {
      id: (conversations[currentUser]?.length || 0) + 1,
      text: messageInput,
      sender: "You",
      timestamp: new Date().toLocaleTimeString(),
      read: false,
    };
    
    const updatedMessages = [...(conversations[currentUser] || []), newMessage];
    setConversations({ ...conversations, [currentUser]: updatedMessages });
    setMessageInput("");
    
    setTimeout(() => {
      const dummyResponses = [
        "Hey, how’s it going?",
        "What are you up to today?",
        "That’s interesting! Tell me more.",
        "Haha, I see what you mean!",
      ];
      
      const dummyMessage: Message = {
        id: updatedMessages.length + 1,
        text: dummyResponses[Math.floor(Math.random() * dummyResponses.length)],
        sender: currentUser,
        timestamp: new Date().toLocaleTimeString(),
        read: false,
      };
      
      setConversations((prevConvos) => ({
        ...prevConvos,
        [currentUser]: [...prevConvos[currentUser], dummyMessage],
      }));
    }, 1500);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 border-r border-gray-200 p-4 px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Search className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex space-x-2 mb-4">
          <button
            className={`px-3 py-1 rounded-2xl w-1/2 md:w-1/5 ${selectedTab === "all" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            onClick={() => setSelectedTab("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-2xl w-1/2 md:w-1/5 ${selectedTab === "unread" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            onClick={() => setSelectedTab("unread")}
          >
            Unread
          </button>
        </div>
        {Object.keys(conversations).length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-sm">You don't have any messages yet</p>
            <p className="text-xs text-gray-400">Start a conversation to see messages here.</p>
          </div>
        ) : (
          Object.keys(conversations).map((user) => (
            <div
              key={user}
              className={`p-4 cursor-pointer flex justify-between items-center hover:bg-gray-200npm runn ${currentUser === user ? "" : ""}`}
            >
              <div className="flex items-center">
                <Avatar alt={user} src="/static/images/avatar/1.jpg" className="mr-2" />
                <Typography onClick={() => { setCurrentUser(user); setActiveChat(true); }}>{user}</Typography>
              </div>
              <button onClick={() => deleteConversation(user)} className="text-gray-500">
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          ))
        )}
        <Button className="mt-4 w-full bg-green-500 text-white" onClick={startNewConversation}>Start New Conversation</Button>
      </div>
      
      {/* Chat Section */}
      <div className="w-full md:w-3/4 flex flex-col h-full p-4 bg-gray-100">
        {!activeChat ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <Card className="flex flex-col w-full h-full p-4 shadow-lg bg-gray-100">
           {/* Chat Header */}
           <Box className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
              <div className="flex items-center">
                <Avatar alt={currentUser || ''} src="/static/images/avatar/1.jpg" className="mr-2" />
                <Typography className="font-semibold">{currentUser}</Typography>
              </div>
              <IconButton onClick={handleMenuOpen}>
              <MoreHorizontalIcon className="cursor-pointer text-gray-500" />
              </IconButton>

              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>View Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>Mute Notifications</MenuItem>
              </Menu>
            </Box>

            <Box className="flex-1 overflow-auto border-b p-2 bg-gray-100 rounded-md px-4 md:px-12 pt-4 md:pt-12">
                {currentUser && conversations[currentUser].length === 0 ? (
                    <Typography className="text-gray-500 text-center">No messages yet. Start the conversation!</Typography>
                ) : (
                    currentUser && conversations[currentUser].map((msg) => (
                    <Box key={msg.id} className={`mb-2 ${msg.sender === "You" ? "text-right" : ""}`}>
                        <Typography className="font-semibold">{msg.sender}</Typography>
                        <Typography className={`${msg.sender === "You" ? "bg-gray-200 text-right" : "bg-white text-black"} p-2 rounded-xl max-w-[75%] inline-block`}>{msg.text}</Typography>
                        <Typography
                        style={{ fontSize: '10px', color: 'gray', paddingLeft: '10px', cursor: 'pointer' }}
                        onClick={() => {
                            const updatedConversations = { ...conversations };
                            const messageIndex = updatedConversations[currentUser].findIndex(m => m.id === msg.id);
                            if (messageIndex !== -1) {
                            updatedConversations[currentUser][messageIndex].read = true;
                            setConversations(updatedConversations);
                            }
                        }}
                        >
                        {msg.timestamp} {msg.read ? "(Read)" : "(Unread)"}
                        </Typography>
                    </Box>
                    ))
                )}
            </Box>
            <Box className="flex items-center p-2 pt-2">
              <TextField
                className="bg-gray-100 rounded-lg"
                variant="outlined"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                multiline
                rows={1.5} 
                inputProps={{
                    maxLength: 500, 
                    }}
                sx={{ flexGrow: 1, maxWidth: '90%', marginRight: '15px',
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                        border: 'none', 
                        },
                        '&:hover fieldset': {
                        border: 'none', 
                        },
                        '&.Mui-focused fieldset': {
                        border: 'none',
                        },
                    },
                 }}
              />
              <Button className="text-white flex items-center" onClick={sendMessage} sx={{ backgroundColor: '#028090',
                 height: '50px',  
                 display: 'flex',
                 alignItems: 'center',  
                    borderRadius: '0.6rem', 
                    padding: '0 16px', 
                    '&:hover': {
                        backgroundColor: '#026f7a', 
                    },
               }}>
               <span className="mr-2 text-white">Send</span>
               <SendIcon className="text-white" />
              </Button>
            </Box>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessagingApp;
