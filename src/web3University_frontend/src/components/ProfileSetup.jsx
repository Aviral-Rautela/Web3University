import React, { useState } from 'react';
import { User, Camera, BookOpen, Users } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';
import ThemeToggle from './ThemeToggle';

const ProfileSetup = ({ onProfileCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    profilePhoto: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const roleEnum = formData.role === 'Student' ? { Student: null } : { Teacher: null };
      const result = await web3University_backend.create_user(
        formData.name,
        roleEnum,
        formData.bio,
        formData.profilePhoto || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
      );

      if (result.Ok) {
        onProfileCreated(result.Ok);
      } else {
        setError(result.Err);
      }
    } catch (error) {
      console.error('Profile creation failed:', error);
      setError('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Create Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Let's set up your Web3 University profile
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="form-label">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Choose Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('Student')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.role === 'Student'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('Teacher')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.role === 'Teacher'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <BookOpen className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Teacher</span>
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">
                Profile Photo URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="profilePhoto"
                  value={formData.profilePhoto}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="https://example.com/photo.jpg"
                />
                <Camera className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default avatar
              </p>
            </div>

            <div>
              <label className="form-label">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Tell us about yourself..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.role || !formData.bio}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'Create Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;