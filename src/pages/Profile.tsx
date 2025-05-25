import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, Edit2, Check, X } from 'lucide-react';
import Card, { CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import config from '../config';

interface UserProfile {
  username: string;
  email: string;
  createdAt: string;
  profilePic?: string | null;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First, try to get data from localStorage
        const token = localStorage.getItem('token');
        const storedUserData = localStorage.getItem('user');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        let userData: UserProfile | null = null;
        
        if (storedUserData) {
          try {
            const parsedData = JSON.parse(storedUserData);
            userData = {
              username: parsedData.username || '',
              email: parsedData.email || '',
              createdAt: parsedData.createdAt || new Date().toISOString(),
              profilePic: parsedData.profilePic || null
            };
            // Set initial data from localStorage
            setProfile(userData);
            setEditedUsername(userData.username);
            if (userData.profilePic) {
              setProfilePic(userData.profilePic);
            }
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
          }
        }

        // Then fetch latest data from server
        const response = await fetch(`${config.API_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const serverData = await response.json();
        const updatedProfile: UserProfile = {
          username: serverData.username || userData?.username || '',
          email: serverData.email || userData?.email || '',
          createdAt: serverData.createdAt || userData?.createdAt || new Date().toISOString(),
          profilePic: serverData.profilePic || userData?.profilePic || null
        };
        
        setProfile(updatedProfile);
        setEditedUsername(updatedProfile.username);
        if (updatedProfile.profilePic) {
          setProfilePic(updatedProfile.profilePic);
        }
        
        // Update localStorage with latest data
        localStorage.setItem('user', JSON.stringify(updatedProfile));
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePic(result);
        // Update profile state
        setProfile(prev => prev ? { ...prev, profilePic: result } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${config.API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: editedUsername,
          profilePic
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      
      const updatedProfile: UserProfile = {
        username: updatedData.username || editedUsername,
        email: updatedData.email || profile?.email || '',
        createdAt: updatedData.createdAt || profile?.createdAt || new Date().toISOString(),
        profilePic: updatedData.profilePic || profilePic
      };
      
      setProfile(updatedProfile);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUsername(profile?.username || '');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div className="flex justify-center">
            <div className="relative group">
              <motion.div 
                className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-white" />
                )}
              </motion.div>
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera size={20} />
              </motion.button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePicChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </motion.div>
          <motion.h2 
            className="mt-6 text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your Profile
          </motion.h2>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-500 p-4 rounded-md mb-6"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Account Information</h3>
              {!isEditing ? (
                <Button onClick={handleEditClick} variant="outline" className="flex items-center gap-2">
                  <Edit2 size={16} />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveClick} variant="primary" className="flex items-center gap-2">
                    <Check size={16} />
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="flex items-center gap-2">
                    <X size={16} />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    placeholder="Enter username"
                    fullWidth
                  />
                ) : (
                  <div className="text-lg font-medium text-gray-900 p-2 bg-white rounded border border-gray-200">
                    {profile?.username || 'Not set'}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="text-lg font-medium text-gray-900 p-2 bg-white rounded border border-gray-200">
                  {profile?.email || 'Not set'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <div className="text-lg font-medium text-gray-900 p-2 bg-white rounded border border-gray-200">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <div className="text-lg font-medium text-green-600 p-2 bg-white rounded border border-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile; 