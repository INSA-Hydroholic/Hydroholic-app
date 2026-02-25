import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  Pressable,
  FlatList,
} from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';

interface Friend {
  id: string;
  name: string;
  username: string;
  status: 'friend' | 'pending' | 'none';
}

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'friends' | 'requests' | 'search'>('friends');

  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'Alex Martin', username: '@alexmartin', status: 'friend' },
    { id: '2', name: 'Emma Johnson', username: '@emmaj', status: 'friend' },
    { id: '3', name: 'Lina Garcia', username: '@linagarcia', status: 'friend' },
    { id: '4', name: 'Pierre Dupont', username: '@pierredupont', status: 'pending' },
  ]);

  const searchResults: Friend[] = [
    { id: '5', name: 'Sarah Chen', username: '@sarahchen', status: 'none' },
    { id: '6', name: 'Marco Rossi', username: '@marcorossi', status: 'none' },
  ];

  const handleAddFriend = (id: string) => {
    // TODO: Faire un appel API
    console.log('Add friend', id);
  };

  const handleRemoveFriend = (id: string) => {
    // TODO: Faire un appel API
    setFriends(friends.filter((f) => f.id !== id));
  };

  const handleAcceptRequest = (id: string) => {
    // TODO: Faire un appel API
    setFriends(
      friends.map((f) => (f.id === id ? { ...f, status: 'friend' } : f))
    );
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View
      style={[
        styles.friendCard,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}>
      <View style={styles.friendInfo}>
        <View
          style={[
            styles.friendAvatar,
            {
              backgroundColor: Palette.secondary,
            },
          ]}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.friendUsername, { color: colors.icon }]}>
            {item.username}
          </Text>
        </View>
      </View>

      {item.status === 'friend' && (
        <Pressable
          onPress={() => handleRemoveFriend(item.id)}
          style={[styles.actionButton, { borderColor: Palette.dark }]}>
          <Text style={[styles.actionButtonText, { color: Palette.dark }]}>✕</Text>
        </Pressable>
      )}

      {item.status === 'pending' && (
        <Pressable
          onPress={() => handleAcceptRequest(item.id)}
          style={[styles.actionButton, { backgroundColor: Palette.accent }]}>
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>✓</Text>
        </Pressable>
      )}

      {item.status === 'none' && (
        <Pressable
          onPress={() => handleAddFriend(item.id)}
          style={[styles.actionButton, { backgroundColor: Palette.secondary }]}>
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>+</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        onMenuPress={() => setMenuVisible(true)}
        onNotificationsPress={() => console.log('Notifications')}
        onProfilePress={() => console.log('Profile')}
        onSearchPress={() => setSelectedTab('search')}
      />

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onItemPress={() => {}}
      />

      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            {
              borderBottomColor: selectedTab === 'friends' ? Palette.secondary : colors.border,
            },
          ]}
          onPress={() => setSelectedTab('friends')}>
          <Text
            style={[
              styles.tabText,
              {
                color:
                  selectedTab === 'friends' ? Palette.secondary : colors.icon,
                fontWeight: selectedTab === 'friends' ? '700' : '500',
              },
            ]}>
            Mes amis
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            {
              borderBottomColor: selectedTab === 'requests' ? Palette.secondary : colors.border,
            },
          ]}
          onPress={() => setSelectedTab('requests')}>
          <Text
            style={[
              styles.tabText,
              {
                color:
                  selectedTab === 'requests' ? Palette.secondary : colors.icon,
                fontWeight: selectedTab === 'requests' ? '700' : '500',
              },
            ]}>
            Demandes
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            {
              borderBottomColor: selectedTab === 'search' ? Palette.secondary : colors.border,
            },
          ]}
          onPress={() => setSelectedTab('search')}>
          <Text
            style={[
              styles.tabText,
              {
                color:
                  selectedTab === 'search' ? Palette.secondary : colors.icon,
                fontWeight: selectedTab === 'search' ? '700' : '500',
              },
            ]}>
            Rechercher
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={
          selectedTab === 'friends'
            ? friends.filter((f) => f.status === 'friend')
            : selectedTab === 'requests'
              ? friends.filter((f) => f.status === 'pending')
              : searchResults
        }
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              {selectedTab === 'friends' && 'Aucun ami pour le moment'}
              {selectedTab === 'requests' && 'Aucune demande en attente'}
              {selectedTab === 'search' && 'Aucun résultat'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          selectedTab === 'search' ? (
            <View style={styles.searchContainer}>
              <InputField
                label=""
                placeholder="Recherche par nom d'utilisateur..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendUsername: {
    fontSize: 12,
    marginTop: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
