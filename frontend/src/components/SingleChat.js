import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { Box, FormControl, IconButton, Input, Spinner, Text, Toast, useToast } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from 'react-lottie';
import animationData from '../animations/typing-animation.json';

const ENDPOINT = 'https://talk2-676e48f9b841.herokuapp.com/';
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const [messages, setMessages] = useState([]);
    const [loding, setLoding] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false)

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
        },
    };

    const toast = useToast();
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const fetchMessages = async () => {
        if(!selectedChat)   return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            }

            setLoding(true);
            const {data} = await axios.get(`/api/message/${selectedChat._id}`, config);

            // console.log(data);
            setMessages(data);
            setLoding(false);

            socket.emit('join chat', selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to load messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    // console.log(messages);

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true));
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop typing', () => setIsTyping(false));
    }, [])

    useEffect(() => {
      fetchMessages();
      selectedChatCompare = selectedChat;
    }, [selectedChat])

    // console.log(notification, "---------");

    useEffect(() => {
      socket.on('message recived', (newMessageRecived) => {
        if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecived.chat._id) {
            // give notification
            if(!notification.includes(newMessageRecived)) {
                setNotification([newMessageRecived, ...notification]);
                setFetchAgain(!fetchAgain);
            }
        } else {
            setMessages([...messages, newMessageRecived]);
        }
      });
    })
    
    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage.trim()) {
            socket.emit('stop typing', selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    }
                }
                setNewMessage("");

                const {data} = await axios.post('/api/message', {
                    content: newMessage.trim(),
                    chatId: selectedChat._id,
                }, config);

                // console.log(data);
                socket.emit('new message', data);

                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };
    
    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        // Typing Logic
        if(!socketConnected)    return;
        if(!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 2000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;

            if(timeDiff >= timerLength && typing) {
                socket.emit('stop typing', selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
        {selectedChat ? 
        (<>
            <Text
                fontSize={{ base: "24px", md: "26px" }}
                pb={3}
                px={2}
                w="100%"
                display="flex"
                justifyContent={{ base: "space-between" }}
                alignItems="center"
            >
                <IconButton
                    display={{ base: "flex", md: "none" }}
                    icon={<ArrowBackIcon />}
                    onClick={() => setSelectedChat("")}
                />
                {!selectedChat.isGroupChat ?(<>
                    {getSender(user, selectedChat.users)}
                        <ProfileModal
                            user={getSenderFull(user, selectedChat.users)}
                        />
                </>) : (<>
                    {selectedChat.chatName}
                    <UpdateGroupChatModal
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                        fetchMessages={fetchMessages}
                    />
                </>)}
            </Text>
            <Box
                display="flex"
                flexDir="column"
                justifyContent="flex-end"
                p={3}
                bg="#E8E8E8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
            >
                {loding ? (
                    <Spinner
                        size="xl"
                        width={20}
                        height={20}
                        alignSelf="center"
                        margin="auto"
                    />
                ) : (
                    <div className="messages" style={{display: "flex", flexDirection: "column", height: "70vh",overflowY: "scroll", scrollbarWidth: "none"}}>
                        <ScrollableChat 
                            messages={messages}
                        />
                    </div>
                )}

                <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                    {isTyping ? <dvi>
                        <Lottie
                            options={defaultOptions}
                            height={30}
                            width={70}
                            style={{ marginBottom: 15, marginLeft: 10 }}
                        />
                        {/* Loading... */}
                    </dvi> : <></>}
                    <Input
                        variant="filled"
                        bg="#E0E0E0"
                        placeholder="Enter Message"
                        onChange={typingHandler}
                        value={newMessage}
                    />

                </FormControl>

            </Box>
        </>) : (
            <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                <Text fontSize="2xl" pb={3} fontWeight={300}>
                    Click on a user to start chatting
                </Text>
            </Box>
        )}
        </>
    );
    // return <div>SingleChat</div>
};

export default SingleChat;
