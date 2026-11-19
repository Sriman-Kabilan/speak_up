import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { getCurrentUser, onAuthChange, logout } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

export default function UserMenu() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      console.log('UserMenu: Auth state changed:', currentUser);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handlePress = () => {
    console.log('UserMenu pressed, user:', user);
    if (user) {
      console.log('Toggling dropdown, current state:', showDropdown);
      setShowDropdown(!showDropdown);
    } else {
      console.log('No user, navigating to SignIn');
      setShowDropdown(false);
      navigation.navigate('SignIn');
    }
  };

  const handleLogout = async () => {
    console.log('Logout pressed');
    setShowDropdown(false);
    await logout();
  };

  const handleViewProgress = () => {
    console.log('View Progress pressed');
    setShowDropdown(false);
    navigation.navigate('Progress');
  };

  const handleProfile = () => {
    console.log('Profile pressed');
    setShowDropdown(false);
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.userButton} onPress={handlePress}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user ? user.name?.charAt(0).toUpperCase() : '👤'}
          </Text>
        </View>
      </TouchableOpacity>
      
      <Modal
        visible={showDropdown && !!user}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('Modal close requested');
          setShowDropdown(false);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => {
            console.log('Modal overlay pressed');
            setShowDropdown(false);
          }}
        >
          <TouchableOpacity 
            style={styles.dropdownContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.dropdown}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
              
              <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
                <Text style={styles.menuIcon}>👤</Text>
                <Text style={styles.menuText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleViewProgress}>
                <Text style={styles.menuIcon}>📊</Text>
                <Text style={styles.menuText}>View Progress</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={styles.menuIcon}>🚪</Text>
                <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  userButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    right: 10,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 220,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
  },
  logoutText: {
    color: '#f44336',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
});
