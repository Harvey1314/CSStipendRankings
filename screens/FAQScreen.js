import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const FAQScreen = () => {
    return (
        <ScrollView>
            <View>
                <Text>Frequently Asked Questions</Text>
                {/* Add FAQ content here */}
                <Text>Q1: How does the stipend ranking work?</Text>
                <Text>A1: Stipends are ranked based on...</Text>
                {/* Add more questions and answers as needed */}
            </View>
        </ScrollView>
    );
};

export default FAQScreen;