import {
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";

const Login = () => {
    const [showP, setShowP] = useState(false);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const handleClickOnP = () => setShowP(!showP);

    const submitHandler = () => {};

    return (
        <VStack spacing="5px">
            <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    type={"email"}
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                ></Input>
            </FormControl>

            <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={showP ? "text" : "password"}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    ></Input>
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClickOnP}>
                            {showP ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button
                colorScheme={"blue"}
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
            >
                Login
            </Button>

            <Button
                variant="solid"
                colorScheme={"red"}
                width="100%"
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("123456");
                }}
            >
                Login as Guest
            </Button>
        </VStack>
    );
};

export default Login;
