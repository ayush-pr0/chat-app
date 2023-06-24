import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import UserBadgeItem from "../UserAvatar/UserBadgeItem"
import UserListItem from "../UserAvatar/UserListItem";
import axios from "axios";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameloading] = useState(false);
    const toast = useToast();

    const handleRemove = async(new_user) => {
        if(selectedChat.groupAdmin._id !== user._id && new_user._id !== user._id) {
          toast({
            title: "Only Admin can remove users!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
        }

        try {
          setLoading(true);
          const config = {
              headers: {
                  Authorization: `Bearer ${user.token}`,
              },
          };

          const { data } = await axios.put(`/api/chats/groupremove`,{
                chatId: selectedChat._id,
                userId: new_user._id,
              },
              config
          );

          new_user._id === user._id ? setSelectedChat() : setSelectedChat(data);
          setFetchAgain(!fetchAgain);
          fetchMessages();
          setLoading(false);

        } catch (error) {
          toast({
            title: "Error Occured!",
            description: error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
        }
    };

    const handleAddUser = async(new_user) => {
        if(selectedChat.users.find((u) => u._id === new_user._id)) {
          toast({
            title: "User Already Exists!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
        }

        if(selectedChat.groupAdmin._id !== user._id) {
          toast({
            title: "Only Admin can add users!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(`/api/chats/groupadd`,{
                  chatId: selectedChat._id,
                  userId: new_user._id,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
        }
    };

    const handleRename = async() => {
        if(!groupChatName) return;

        if(selectedChat.groupAdmin._id !== user._id) {
          toast({
            title: "Only Admin can rename",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
        }

        try {
            setRenameloading(true);
            
            const config = {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }

            const {data} = await axios.put('/api/chats/rename', {
              chatId: selectedChat._id,
              chatName: groupChatName,
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameloading(false);

        } 
        catch (error) {
            toast({
              title: "Error Occured!",
              description: error.response.data.message,
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
            setRenameloading(false);
        }
        setGroupChatName("");
        onClose();
    };

    const handleSearch = async (search) => {
        if (!search) {
          setSearchResult([]);
            // toast({
            //     title: "Please enter something in search",
            //     status: "warning",
            //     duration: 5000,
            //     isClosable: true,
            //     position: "top-left",
            // });
            return;
        }
        // console.log(search);
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(
                `/api/user?search=${search}`,
                config
            );
            // console.log(data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Result",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const { selectedChat, setSelectedChat, user } = ChatState();
    return (
        <>
          <IconButton display={{base : "flex"}} icon={<InfoOutlineIcon/>} onClick={onOpen} />
          
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
                fontSize="24px"
                display="flex"
                justifyContent="center"
              >{selectedChat.chatName}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                {selectedChat.users.map((u) => (
                    <UserBadgeItem
                    key={u._id}
                    user={u}
                    admin={selectedChat.groupAdmin}
                    handleFunction={() => handleRemove(u)}
                    />
                ))}
                </Box>

                <FormControl display="flex">
                  <Input
                    placeholder="New Group Name"
                    mb={3}
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />
                  <Button
                    variant="solid"
                    colorScheme="teal"
                    ml={1}
                    isLoading={renameloading}
                    onClick={handleRename}
                  >
                    Update
                  </Button>
                </FormControl>
                <FormControl>
                  <Input
                    placeholder="Add User to group"
                    mb={1}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </FormControl>
                {loading ? (
                  <Spinner size="lg" />
                  ) : (
                  searchResult?.map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleAddUser(user)}
                    />
                  ))
                )}

              </ModalBody>
    
              <ModalFooter>
                <Button onClick={() => handleRemove(user)} colorScheme="red">
                  Leave Group
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default UpdateGroupChatModal