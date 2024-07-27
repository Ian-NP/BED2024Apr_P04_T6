const sql = require('mssql');
const Admin = require('../models/admin'); 

jest.mock('mssql');

describe('Admin Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllAdminUsers', () => {
        it('should return all admin users', async () => {
            const mockRecordset = [
                { adminId: 1, name: 'Admin1', password: 'hashedPassword1', adminEmail: 'admin1@example.com' },
                { adminId: 2, name: 'Admin2', password: 'hashedPassword2', adminEmail: 'admin2@example.com' }
            ];
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
                }),
                close: jest.fn()
            });

            const admins = await Admin.getAllAdminUsers();
            expect(admins).toHaveLength(2);
            expect(admins[0].name).toBe('Admin1');
            expect(sql.connect).toHaveBeenCalled();
        });
    });

    describe('getAdminById', () => {
        it('should return an admin by ID', async () => {
            const mockRecordset = [
                { adminId: 1, name: 'Admin1', password: 'hashedPassword1', adminEmail: 'admin1@example.com' }
            ];
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
                }),
                close: jest.fn()
            });

            const admin = await Admin.getAdminById(1);
            expect(admin).toBeInstanceOf(Admin);
            expect(admin.name).toBe('Admin1');
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should return null if no admin is found', async () => {
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ recordset: [] })
                }),
                close: jest.fn()
            });

            const admin = await Admin.getAdminById(999);
            expect(admin).toBeNull();
            expect(sql.connect).toHaveBeenCalled();
        });
    });

    describe('getAdminProfile', () => {
        it('should return admin profile data', async () => {
            const mockRecordset = [
                { name: 'Admin1', adminEmail: 'admin1@example.com', profilePicture: 'profilePicData' }
            ];
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
                }),
                close: jest.fn()
            });

            const profile = await Admin.getAdminProfile(1);
            expect(profile.name).toBe('Admin1');
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should throw an error on database failure', async () => {
            sql.connect.mockRejectedValue(new Error('Database query failed'));

            await expect(Admin.getAdminProfile(1)).rejects.toThrow('Database query failed');
        });
    });

    describe('getAdminProfilePicture', () => {
        it('should return admin profile picture', async () => {
            const mockRecordset = [
                { profilePicture: 'profilePicData' }
            ];
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
                }),
                close: jest.fn()
            });

            const profilePicture = await Admin.getAdminProfilePicture(1);
            expect(profilePicture.profilePicture).toBe('profilePicData');
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should throw an error on database failure', async () => {
            sql.connect.mockRejectedValue(new Error('Database query failed'));

            await expect(Admin.getAdminProfilePicture(1)).rejects.toThrow('Database query failed');
        });
    });

    describe('updateAdminProfilePicture', () => {
        it('should update admin profile picture', async () => {
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
                }),
                close: jest.fn()
            });

            const result = await Admin.updateAdminProfilePicture(1, Buffer.from('newProfilePicData'));
            expect(result).toBe(true);
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should return false if no rows are affected', async () => {
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
                }),
                close: jest.fn()
            });

            const result = await Admin.updateAdminProfilePicture(1, Buffer.from('newProfilePicData'));
            expect(result).toBe(false);
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            sql.connect.mockRejectedValue(new Error('Database update failed'));

            await expect(Admin.updateAdminProfilePicture(1, Buffer.from('newProfilePicData'))).rejects.toThrow('Database update failed');
        });
    });

    describe('createAdminUser', () => {
        it('should create a new admin user', async () => {
            const newAdminData = { name: 'NewAdmin', password: 'password', adminEmail: 'newadmin@example.com' };
            const mockRecordset = [{ adminId: 1 }];
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
                }),
                close: jest.fn()
            });

            Admin.getAdminById = jest.fn().mockResolvedValue(new Admin(1, 'NewAdmin', 'hashedPassword', 'newadmin@example.com'));

            const admin = await Admin.createAdminUser(newAdminData);
            expect(admin).toBeInstanceOf(Admin);
            expect(admin.name).toBe('NewAdmin');
            expect(sql.connect).toHaveBeenCalled();
        });
    });

    describe('updateAdminUser', () => {
        it('should update admin user details', async () => {
            // Mock the SQL connection and queries
            const mockUpdatedAdmin = {
                adminId: 1,
                name: 'UpdatedAdmin',
                password: 'hashedPassword',
                adminEmail: 'updatedadmin@example.com'
            };
            
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
                }),
                close: jest.fn()
            });
    
            // Mock getAdminById to return the updated admin
            Admin.getAdminById = jest.fn().mockResolvedValue(mockUpdatedAdmin);
    
            const updatedAdmin = await Admin.updateAdminUser(1, { name: 'UpdatedAdmin' });
    
            expect(updatedAdmin).toEqual(mockUpdatedAdmin); // Ensure equality
            expect(updatedAdmin.name).toBe('UpdatedAdmin'); // Check specific property
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            sql.connect.mockRejectedValue(new Error('Database update failed'));

            await expect(Admin.updateAdminUser(1, { name: 'UpdatedAdmin' })).rejects.toThrow('Database update failed');
        });
    });

    describe('deleteAdmin', () => {
        it('should delete an admin user', async () => {
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ rowsAffected: [1] })
                }),
                close: jest.fn()
            });

            const result = await Admin.deleteAdmin(1);
            expect(result).toBe(true);
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should return false if no rows are affected', async () => {
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ rowsAffected: [0] })
                }),
                close: jest.fn()
            });

            const result = await Admin.deleteAdmin(1);
            expect(result).toBe(false);
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            sql.connect.mockRejectedValue(new Error('Database delete failed'));

            await expect(Admin.deleteAdmin(1)).rejects.toThrow('Database delete failed');
        });
    });

    describe('getAdminByEmail', () => {
        it('should return an admin by email', async () => {
            const mockRecordset = [
                { adminId: 1, name: 'Admin1', password: 'hashedPassword1', adminEmail: 'admin1@example.com' }
            ];
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ recordset: mockRecordset })
                }),
                close: jest.fn()
            });

            const admin = await Admin.getAdminByEmail('admin1@example.com');
            expect(admin).toBeInstanceOf(Admin);
            expect(admin.name).toBe('Admin1');
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should return null if no admin is found', async () => {
            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnValue({
                    input: jest.fn().mockReturnThis(),
                    query: jest.fn().mockResolvedValue({ recordset: [] })
                }),
                close: jest.fn()
            });

            const admin = await Admin.getAdminByEmail('nonexistent@example.com');
            expect(admin).toBeNull();
            expect(sql.connect).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            sql.connect.mockRejectedValue(new Error('Database query failed'));

            await expect(Admin.getAdminByEmail('admin1@example.com')).rejects.toThrow('Database query failed');
        });
    });
});
