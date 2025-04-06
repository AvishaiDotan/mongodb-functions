import { faker } from '@faker-js/faker';

export class RandomService {
    /**
     * Generates a single random object with various data types
     * @param withId Whether to include a custom ID (default: true)
     * @returns A random object
     */
    static generate(withId: boolean = true): any {
        return this.generateMany(1, withId)[0];
    }

    /**
     * Generates multiple random objects with various data types
     * @param count Number of objects to generate (default: 1)
     * @param withId Whether to include a custom ID (default: true)
     * @returns Array of random objects
     */
    static generateMany(count: number = 1, withId: boolean = true): any[] {
        const result: any[] = [];
        
        for (let i = 0; i < count; i++) {
            const randomObject = {
                ...(withId && { _id: faker.string.uuid() }),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                    zipCode: faker.location.zipCode(),
                    country: faker.location.country()
                },
                company: faker.company.name(),
                jobTitle: faker.person.jobTitle(),
                bio: faker.lorem.paragraph(),
                website: faker.internet.url(),
                createdAt: faker.date.past(),
                updatedAt: faker.date.recent(),
                isActive: faker.datatype.boolean(),
                age: faker.number.int({ min: 18, max: 80 }),
                salary: faker.number.float({ min: 30000, max: 150000, fractionDigits: 2 }),
                tags: faker.helpers.arrayElements(['tech', 'finance', 'health', 'education', 'entertainment'], { min: 1, max: 3 }),
                avatar: faker.image.avatar(),
                coordinates: {
                    latitude: faker.location.latitude(),
                    longitude: faker.location.longitude()
                }
            };
            
            result.push(randomObject);
        }
        
        return result;
    }
} 