const sql = require('mssql');
const User = require('../models/user');

jest.mock('mssql', () => {
    const mssql = {
      connect: jest.fn(),
      close: jest.fn(),
      Request: jest.fn().mockImplementation(() => ({
        input: jest.fn(),
        query: jest.fn()
      }))
    };
    return mssql;
  });
jest.mock('bcrypt');

  describe('User Model', () => {
    describe('getAllUsers', () => {
      it('should return all users', async () => {
        const mockUsers = [
          { userId: 1, email: 'user1@example.com', name: 'User One', password: 'password', userType: 'U' },
          { userId: 2, email: 'user2@example.com', name: 'User Two', password: 'password', userType: 'C' }
        ];
  
        sql.connect.mockResolvedValueOnce({
          request: jest.fn().mockReturnValue({
            query: jest.fn().mockResolvedValue({ recordset: mockUsers })
          }),
          close: jest.fn()
        });
  
        const result = await User.getAllUsers();
        expect(result).toEqual(mockUsers.map(user => new User(user.userId, user.email, user.name, user.password, user.userType)));
      });
  
      it('should handle errors', async () => {
        sql.connect.mockRejectedValueOnce(new Error('Database query failed'));
  
        await expect(User.getAllUsers()).rejects.toThrow('Database query failed');
      });
    });

    describe('getUserByUserId', () => {
        it('should return user by userId', async () => {
          const mockUser = { userId: 1, email: 'user1@example.com', name: 'User One', password: 'password', userType: 'U' };
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ recordset: [mockUser] })
            }),
            close: jest.fn()
          });
      
          const result = await User.getUserByUserId(1);
          expect(result).toEqual(new User(mockUser.userId, mockUser.email, mockUser.name, mockUser.password, mockUser.userType));
        });
      
        it('should return null if user not found', async () => {
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ recordset: [] })
            }),
            close: jest.fn()
          });
      
          const result = await User.getUserByUserId(999);
          expect(result).toBeNull();
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database query failed'));
      
          await expect(User.getUserByUserId(1)).rejects.toThrow('Database query failed');
        });
      });

      describe('getUserProfile', () => {
        it('should return user profile data', async () => {
          const mockProfile = { userId: 1, email: 'user1@example.com', name: 'User One', about: 'About User One' };
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              query: jest.fn().mockResolvedValue({ recordset: [mockProfile] })
            }),
            close: jest.fn()
          });
      
          const result = await User.getUserProfile();
          expect(result).toEqual(mockProfile);
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database query failed'));
      
          await expect(User.getUserProfile(1)).rejects.toThrow('Database query failed');
        });
      });

      describe('getUserProfilePicture', () => {
        it('should return user profile picture', async () => {
          const mockPicture = { userId: 1, profilePicture: 'path/to/picture.jpg' };
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              query: jest.fn().mockResolvedValue({ recordset: [mockPicture] })
            }),
            close: jest.fn()
          });
      
          const result = await User.getUserProfilePicture(1);
          expect(result).toEqual(mockPicture);
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database query failed'));
      
          await expect(User.getUserProfilePicture(1)).rejects.toThrow('Database query failed');
        });
      });

      describe('updateUserProfilePicture', () => {
        it('should update the user profile picture', async () => {
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
            }),
            close: jest.fn()
          });
      
          const result = await User.updateUserProfilePicture(1, 'path/to/newpicture.jpg');
          expect(result).toBe(true);
        });
      
        it('should return false if no rows are updated', async () => {
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
            }),
            close: jest.fn()
          });
      
          const result = await User.updateUserProfilePicture(1, 'path/to/newpicture.jpg');
          expect(result).toBe(false);
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database update failed'));
      
          await expect(User.updateUserProfilePicture(1, 'path/to/newpicture.jpg')).rejects.toThrow('Database update failed');
        });
      });

      describe('createUser', () => {
        it('should create a new user', async () => {
          const newUser = { email: 'newuser@example.com', name: 'New User', password: 'password', userType: 'U' };
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ rowsAffected: [1], recordset: [{ userId: 1 }] })
            }),
            close: jest.fn()
          });
      
          const result = await User.createUser(newUser);
          expect(result).toEqual({ success: true, message: 'User signed up successfully', userId: 1 });
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Error signing up user'));
      
          await expect(User.createUser({})).rejects.toThrow('Error signing up user');
        });
      });

      describe('updateUser', () => {
        it('should update user details', async () => {
          const userId = 1;
          const newUserData = { email: 'updateduser@example.com', name: 'Updated User' };
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
            }),
            close: jest.fn()
          });
      
          const result = await User.updateUser(userId, newUserData);
          expect(result).toBe(true);
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database update failed'));
      
          await expect(User.updateUser(1, {})).rejects.toThrow('Database update failed');
        });
      });

      describe('deleteUser', () => {
        it('should delete a user', async () => {
          const userId = 1;
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
            }),
            close: jest.fn()
          });
      
          const result = await User.deleteUser(userId);
          expect(result).toBe(true);
        });
      
        it('should return false if user not found', async () => {
          const userId = 999;
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
            }),
            close: jest.fn()
          });
      
          const result = await User.deleteUser(userId);
          expect(result).toBe(false);
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database delete failed'));
      
          await expect(User.deleteUser(1)).rejects.toThrow('Database delete failed');
        });
      });

      describe('getUserByEmail', () => {
        it('should return user by email', async () => {
          const mockUser = { userId: 1, email: 'user1@example.com', name: 'User One', password: 'password', userType: 'U' };
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ recordset: [mockUser] })
            }),
            close: jest.fn()
          });
      
          const result = await User.getUserByEmail('user1@example.com');
          expect(result).toEqual(new User(mockUser.userId, mockUser.email, mockUser.name, mockUser.password, mockUser.userType));
        });
      
        it('should return null if user not found', async () => {
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ recordset: [] })
            }),
            close: jest.fn()
          });
      
          const result = await User.getUserByEmail('nonexistent@example.com');
          expect(result).toBeNull();
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database query failed'));
      
          await expect(User.getUserByEmail('user1@example.com')).rejects.toThrow('Database query failed');
        });
      });

      describe('getUserAboutProfile', () => {
        it('should return user about profile data', async () => {
          const mockAboutProfile = { userId: 1, about: 'About User One' };
      
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              query: jest.fn().mockResolvedValue({ recordset: [mockAboutProfile] })
            }),
            close: jest.fn()
          });
      
          const result = await User.getUserAboutProfile(1);
          expect(result).toEqual(mockAboutProfile);
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database query failed'));
      
          await expect(User.getUserAboutProfile(1)).rejects.toThrow('Database query failed');
        });
      });

      describe('updateUserAboutProfile', () => {
        it('should update user about profile data', async () => {
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
            }),
            close: jest.fn()
          });
      
          const result = await User.updateUserAboutProfile(1, 'Updated about text');
          expect(result).toBe(true);
        });
      
        it('should return false if no rows are updated', async () => {
          sql.connect.mockResolvedValueOnce({
            request: jest.fn().mockReturnValue({
              input: jest.fn(),
              query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
            }),
            close: jest.fn()
          });
      
          const result = await User.updateUserAboutProfile(1, 'Updated about text');
          expect(result).toBe(false);
        });
      
        it('should handle errors', async () => {
          sql.connect.mockRejectedValueOnce(new Error('Database update failed'));
      
          await expect(User.updateUserAboutProfile(1, 'Updated about text')).rejects.toThrow('Database update failed');
        });
      });
      
      
      
      
      
      
      
      
      
      
  
    // Similar adjustments for other tests
  });

//   describe('getAllUsers', () => {
//     it('should return all users', async () => {
//       const mockUsers = [
//         { userId: 1, email: 'john@example.com', name: 'John Doe', password: 'hashed_password', userType: 'U' },
//         { userId: 2, email: 'jane@example.com', name: 'Jane Doe', password: 'hashed_password', userType: 'C' }
//       ];

//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ recordset: mockUsers })
//         })
//       });

//       const result = await User.getAllUsers();
//       expect(result).toEqual(mockUsers.map(user => new User(user.userId, user.email, user.name, user.password, user.userType)));
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database error'));

//       await expect(User.getAllUsers()).rejects.toThrow('Database error');
//     });
//   });

//   describe('getUserByUserId', () => {
//     it('should return user by userId', async () => {
//       const mockUser = { userId: 1, email: 'john@example.com', name: 'John Doe', password: 'hashed_password', userType: 'U' };

//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ recordset: [mockUser] })
//         })
//       });

//       const result = await User.getUserByUserId(1);
//       expect(result).toEqual(new User(mockUser.userId, mockUser.email, mockUser.name, mockUser.password, mockUser.userType));
//     });

//     it('should return null if user not found', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ recordset: [] })
//         })
//       });

//       const result = await User.getUserByUserId(1);
//       expect(result).toBeNull();
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database error'));

//       await expect(User.getUserByUserId(1)).rejects.toThrow('Database error');
//     });
//   });

//   describe('getUserProfile', () => {
//     it('should return user profile data', async () => {
//       const mockProfile = { name: 'John Doe', email: 'john@example.com', userType: 'U', paypalEmail: 'john@example.com', profilePicture: 'picture_path' };

//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ recordset: [mockProfile] })
//         })
//       });

//       const result = await User.getUserProfile(1);
//       expect(result).toEqual(mockProfile);
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database query failed'));

//       await expect(User.getUserProfile(1)).rejects.toThrow('Database query failed');
//     });
//   });

//   describe('getUserProfilePicture', () => {
//     it('should return user profile picture', async () => {
//       const mockPicture = { profilePicture: 'picture_path' };

//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ recordset: [mockPicture] })
//         })
//       });

//       const result = await User.getUserProfilePicture(1);
//       expect(result).toEqual(mockPicture);
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database query failed'));

//       await expect(User.getUserProfilePicture(1)).rejects.toThrow('Database query failed');
//     });
//   });

//   describe('updateUserProfilePicture', () => {
//     it('should update the user profile picture', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
//         })
//       });

//       const result = await User.updateUserProfilePicture(1, 'new_picture_path');
//       expect(result).toBe(true);
//     });

//     it('should return false if no rows are updated', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
//         })
//       });

//       const result = await User.updateUserProfilePicture(1, 'new_picture_path');
//       expect(result).toBe(false);
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database update failed'));

//       await expect(User.updateUserProfilePicture(1, 'new_picture_path')).rejects.toThrow('Database update failed');
//     });
//   });

//   describe('createUser', () => {
//     it('should create a new user', async () => {
//       const newUser = { email: 'new@example.com', firstName: 'New', password: 'password', userType: 'U', paypalEmail: null };
//       const mockResult = { recordset: [{ userId: 1 }] };

//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue(mockResult)
//         })
//       });

//       const result = await User.createUser(newUser);
//       expect(result).toEqual({ success: true, message: 'User signed up successfully', userId: 1 });
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database insert failed'));

//       const newUser = { email: 'new@example.com', firstName: 'New', password: 'password', userType: 'U', paypalEmail: null };
//       const result = await User.createUser(newUser);
//       expect(result).toEqual({ success: false, message: 'Error signing up user' });
//     });
//   });

//   describe('updateUser', () => {
//     it('should update user details', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
//         })
//       });

//       const updatedUser = await User.updateUser(1, { email: 'updated@example.com', name: 'Updated Name' });
//       expect(updatedUser).toEqual(expect.any(User));
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database update failed'));

//       await expect(User.updateUser(1, { email: 'updated@example.com', name: 'Updated Name' })).rejects.toThrow('Database update failed');
//     });
//   });

//   describe('deleteUser', () => {
//     it('should delete a user', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
//         })
//       });

//       const result = await User.deleteUser(1);
//       expect(result).toBe(true);
//     });

//     it('should return false if user not found', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
//         })
//       });

//       const result = await User.deleteUser(1);
//       expect(result).toBe(false);
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database delete failed'));

//       await expect(User.deleteUser(1)).rejects.toThrow('Database delete failed');
//     });
//   });

//   describe('getUserByEmail', () => {
//     it('should return user by email', async () => {
//       const mockUser = { userId: 1, email: 'john@example.com', name: 'John Doe', password: 'hashed_password', userType: 'U' };

//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ recordset: [mockUser] })
//         })
//       });

//       const result = await User.getUserByEmail('john@example.com');
//       expect(result).toEqual(new User(mockUser.userId, mockUser.email, mockUser.name, mockUser.password, mockUser.userType));
//     });

//     it('should return null if user not found', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ recordset: [] })
//         })
//       });

//       const result = await User.getUserByEmail('nonexistent@example.com');
//       expect(result).toBeNull();
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database query failed'));

//       await expect(User.getUserByEmail('john@example.com')).rejects.toThrow('Database query failed');
//     });
//   });

//   describe('getUserAboutProfile', () => {
//     it('should return user about profile', async () => {
//       const mockAbout = { userId: 1, about: 'About me' };

//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ recordset: [mockAbout] })
//         })
//       });

//       const result = await User.getUserAboutProfile(1);
//       expect(result).toEqual(mockAbout);
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database query failed'));

//       await expect(User.getUserAboutProfile(1)).rejects.toThrow('Database query failed');
//     });
//   });

//   describe('updateUserAboutProfile', () => {
//     it('should update the user about profile', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
//         })
//       });

//       const result = await User.updateUserAboutProfile(1, { about: 'Updated about me' });
//       expect(result).toBe(true);
//     });

//     it('should return false if no rows are updated', async () => {
//       sql.connect.mockResolvedValueOnce({
//         request: jest.fn().mockReturnValue({
//           query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
//         })
//       });

//       const result = await User.updateUserAboutProfile(1, { about: 'Updated about me' });
//       expect(result).toBe(false);
//     });

//     it('should handle errors', async () => {
//       sql.connect.mockRejectedValueOnce(new Error('Database update failed'));

//       await expect(User.updateUserAboutProfile(1, { about: 'Updated about me' })).rejects.toThrow('Database update failed');
//     });
//   });

