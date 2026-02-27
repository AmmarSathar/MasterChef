"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
// Example controller using shared types
const getUser = async (id) => {
    try {
        // Your logic here
        const user = {
            id: '1',
            email: 'user@example.com',
            name: 'John Doe',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return {
            success: true,
            data: user,
        };
    }
    catch (error) {
        return {
            success: false,
            error: 'Failed to fetch user',
        };
    }
};
exports.getUser = getUser;
//# sourceMappingURL=using-shared-types.js.map