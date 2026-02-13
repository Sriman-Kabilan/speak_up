import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import LessonsScreen from './src/screens/LessonListScreen';
import ExerciseListScreen from './src/screens/ExerciseListScreen';
import PracticeExerciseScreen from './src/screens/PracticeExerciseScreen';
import ResultScreen from './src/screens/ResultScreen';
import ProgressScreen from './src/screens/ProgressScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SpeakUp' }} />
        <Stack.Screen name="Lessons" component={LessonsScreen} options={{ title: 'Learning Path' }} />
        <Stack.Screen name="Practice" component={ExerciseListScreen} options={{ title: 'Exercises' }} />
        <Stack.Screen name="PracticeExercise" component={PracticeExerciseScreen} options={{ title: 'Practice' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Result' }} />
        <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
