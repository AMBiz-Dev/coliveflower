import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, Button } from "react-native";

type Message = {
  id: string;
  text: string;
  sender: string;
};

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Simulated messages (replace with your backend logic)
  const dummyMessages = [
    { id: "1", text: "Hello", sender: "User1" },
    { id: "2", text: "Hi there!", sender: "User2" },
  ];

  useEffect(() => {
    // Load messages from your backend here
    setMessages(dummyMessages);
  }, []);

  const handleSend = () => {
    // Send the new message to the backend and add it to the UI
    const newMessageObject = {
      id: (Math.random() * 1000000).toString(),
      text: newMessage,
      sender: "User1", // Replace with actual sender info
    };

    // Simulated: Add the message locally for immediate display
    setMessages([...messages, newMessageObject]);

    // Clear the input field
    setNewMessage("");

    // Send the message to the backend for storage and real-time communication
    // Replace with your backend logic here
  };

  const renderItem = ({item}: {item: Message}) => (
    <View
      style={{
        padding: 8,
        backgroundColor: "lightgray",
        borderRadius: 8,
        marginVertical: 4,
      }}
    >
      <Text>{item.text}</Text>
      <Text style={{ color: "gray" }}>{item.sender}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted // New messages appear at the bottom
      />
      <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
        <TextInput
          placeholder="Type your message..."
          style={{
            flex: 1,
            marginRight: 8,
            borderWidth: 1,
            borderColor: "gray",
            borderRadius: 8,
            padding: 8,
          }}
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
};

export default Messages;
