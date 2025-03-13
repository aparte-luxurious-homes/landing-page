import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MoreHorizontalIcon, Search } from 'lucide-react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Card,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, isToday, isYesterday } from 'date-fns';
import {
  // useLazyGetConversationMessagesQuery,
  useCreateConversationMutation,
  useGetConversationsQuery,
} from '~/api/chatApi';
import { useAppSelector } from '~/hooks';
import { useMessages } from '~/hooks/useMessages';
import { useChat } from '~/hooks/useChat';
import { useMobileView } from '~/hooks/useMobileView';
import PageLayout from '../../components/pagelayout/index';

interface Conversations {
  [key: string]: Message[];
}

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
  read: boolean;
}

const MessagingApp = () => {
  const { userId, email } = useAppSelector((state) => state.root.auth);
  const location = useLocation();
  const { data: conversationsResult } = useGetConversationsQuery();
  const [createConversation] = useCreateConversationMutation();

  const { conversationId, counterparty } = location.state || {
    conversationId: '',
    counterparty: '',
  };

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(conversationId || null);

  const { sendMessage } = useChat(activeConversationId);
  const messages = useMessages(activeConversationId);

  const isMobile = useMobileView(600);

  const [activeChat, setActiveChat] = useState<boolean>(false);
  const [showConversationsList, setConversationsListVisibility] =
    useState<boolean>(!isMobile);

  const [selectedTab, setSelectedTab] = useState('all');

  const [conversations, setConversations] = useState<Conversations>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);

  // useEffect(() => {
  //   const handleResize = () => {
  //     alert(isMobile);
  //   };
  //   handleResize()
  // }, [isMobile]);

  useEffect(() => {
    if (!counterparty || !userId) return; // Ensure both IDs exist before calling

    const triggerCreateConversation = async () => {
      try {
        const conversation = await createConversation({
          user_one_id: userId,
          user_two_id: counterparty,
        }).unwrap();
        if (conversation?.conversationId) {
          setActiveConversationId(conversation?.conversationId);
          setActiveChat(true);
        }
        console.log('Conversation created:', conversation);
      } catch (e) {
        console.log('UNABLE TO CREATE CONVO: ', e);
      }
    };

    triggerCreateConversation(); // Call function directly
  }, [userId, counterparty, createConversation]);

  const getRecipient = (conversation: any) =>
    conversation?.userOne.email === email
      ? conversation?.userTwo
      : conversation?.userOne;

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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const formatChatDate = (timestamp?: string) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);

    if (isToday(date)) {
      return `Today at ${format(date, 'hh:mm a')}`; // "Today at 4:30 PM"
    }
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'hh:mm a')}`; // "Yesterday at 9:15 AM"
    }
    return format(date, "MMM dd, yyyy 'at' hh:mm a"); // "Mar 10, 2024 at 8:45 PM"
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row h-screen bg-white px-4 md:px-8 pt-12 md:pt-20">
        {/* Sidebar */}
        {showConversationsList && (
          <div className="w-full md:w-1/4 border-r border-gray-200 p-4 px-6">
            <div className="flex items-center justify-between mb-10 mt-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex space-x-2 mb-4">
              <button
                className={`px-3 py-1 rounded-2xl w-1/2 md:w-1/3 ${
                  selectedTab === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black'
                }`}
                onClick={() => setSelectedTab('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded-2xl w-1/2 md:w-1/3 ${
                  selectedTab === 'unread'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black'
                }`}
                onClick={() => setSelectedTab('unread')}
              >
                Unread
              </button>
            </div>
            {!conversationsResult || !conversationsResult.data.length ? (
              <div className="text-center text-gray-500 mt-10">
                <p className="text-sm">You don't have any messages yet</p>
                <p className="text-xs text-gray-400">
                  Start a conversation to see messages here.
                </p>
              </div>
            ) : (
              conversationsResult.data.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer flex justify-between items-center hover:bg-gray-200 ${
                    currentUser === conversation.id ? '' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <Avatar
                      alt={conversation.id}
                      src="/static/images/avatar/1.jpg"
                      className="mr-2"
                    />
                    <Typography
                      onClick={() => {
                        setActiveConversationId(conversation.id);
                        setActiveChat(true);
                        if (isMobile) {
                          setConversationsListVisibility(false);
                        }
                      }}
                    >
                      {getRecipient(conversation)?.email?.split('@')[0]}
                    </Typography>
                  </div>
                  <button
                    onClick={() => deleteConversation(conversation.id)}
                    className="text-gray-500"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              ))
            )}
            <Button
              className="mt-4 w-full bg-green-500 text-white"
              onClick={startNewConversation}
            >
              Start New Conversation
            </Button>
          </div>
        )}

        {/* Chat Section */}
        {showConversationsList && isMobile ? (
          <></>
        ) : (
          <div className="w-full md:w-3/4 flex flex-col h-full p-4 bg-gray-100">
            {!activeChat ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Select a conversation to start chatting</p>
              </div>
            ) : (
              <Card className="flex flex-col w-full h-full p-2 md:p-4 shadow-lg bg-gray-100">
                {/* Chat Header */}
                <Box className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
                  <div className="flex items-center">
                    <Avatar
                      alt={currentUser || ''}
                      src="/static/images/avatar/1.jpg"
                      className="mr-2"
                    />
                    <Typography className="font-semibold">
                      {currentUser}
                    </Typography>
                  </div>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreHorizontalIcon className="cursor-pointer text-gray-500" />
                  </IconButton>

                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleMenuClose}>View Profile</MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                      Mute Notifications
                    </MenuItem>
                    {isMobile && (
                      <MenuItem
                        className="block md:hiden"
                        onClick={() => {
                          setConversationsListVisibility(
                            !showConversationsList
                          );
                          handleMenuClose();
                        }}
                      >
                        Chat history
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
                <Box className="flex-1 overflow-auto border-b p-2 bg-gray-100 rounded-md px-4 md:px-12 pt-4 md:pt-12">
                  {/* <ChatSkeleton /> */}
                  {messages.length < 1 ? (
                    <Typography className="text-gray-500 text-center">
                      No messages yet. Start the conversation!
                    </Typography>
                  ) : (
                    messages.map((msg) => (
                      <Box
                        key={msg.id || msg?.messageId}
                        className={`mb-2 ${
                          msg?.senderId === userId ? 'text-right' : ''
                        }`}
                      >
                        <Typography className="font-semibold">
                          {msg?.sender}
                        </Typography>
                        <Typography
                          className={`${
                            msg?.senderId === userId
                              ? 'bg-gray-200 text-justify'
                              : 'bg-white text-black'
                          } p-2 rounded-xl max-w-[60%] md:max-w-[60%] inline-block break-words whitespace-normal overflow-wrap-anywhere`}
                        >
                          {msg?.text}
                        </Typography>
                        <Typography
                          style={{
                            fontSize: '10px',
                            color: 'gray',
                            paddingLeft: '10px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {}}
                        >
                          {formatChatDate(msg?.createdAt)}{' '}
                          <small>{msg?.status}</small>
                          {/* {msg?.read ? '(Read)' : '(Unread)'} */}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
                <Box className="flex flex-col md:flex-row items-end md:items-center gap-2 p-2 pt-2">
                  <TextField
                    className="bg-gray-100 rounded-lg w-full"
                    variant="outlined"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyUp={handleKeyPress}
                    size="small"
                    multiline
                    rows={1.5}
                    inputProps={{
                      maxLength: 500,
                    }}
                    sx={{
                      flexGrow: 1,
                      maxWidth: '100%',
                      // marginRight: '15px',
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
                  <Button
                    className="mt-4 md:mt-0 text-white flex items-center"
                    onClick={() => {
                      sendMessage(messageInput);
                      setMessageInput('');
                    }}
                    sx={{
                      backgroundColor: '#028090',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '0.6rem',
                      padding: '0 16px',
                      '&:hover': {
                        backgroundColor: '#026f7a',
                      },
                    }}
                  >
                    <span className="mr-2 text-white">Send</span>
                    <SendIcon className="text-white" />
                  </Button>
                </Box>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};


export default MessagingApp;
