import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import LessonsScreen from './src/screens/LessonListScreen';
import ExerciseListScreen from './src/screens/ExerciseListScreen';
import PracticeExerciseScreen from './src/screens/PracticeExerciseScreen';
import ResultScreen from './src/screens/ResultScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UserMenu from './src/components/UserMenu';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Override Expo's default body overflow:hidden to enable scrolling
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <UserMenu />,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SpeakUp' }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In', headerRight: null }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up', headerRight: null }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="Lessons" component={LessonsScreen} options={{ title: 'Learning Path' }} />
        <Stack.Screen name="Practice" component={ExerciseListScreen} options={{ title: 'Exercises' }} />
        <Stack.Screen name="PracticeExercise" component={PracticeExerciseScreen} options={{ title: 'Practice' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Result' }} />
        <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
