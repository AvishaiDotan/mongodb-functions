import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';

export interface Field {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Item {
    values: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Table {
    _id?: ObjectId;
    name: string;
    description: string;
    fields: Field[];
    items: Item[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Workbook {
    _id?: ObjectId;
    name: string;
    description: string;
    tables: Table[];
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    _id?: ObjectId;
    name: string;
    email: string;
    workbooks: Workbook[];
    createdAt: Date;
    updatedAt: Date;
}

export class EntityGeneratorService {
    private static generateField(): Field {
        const fieldTypes: Field['type'][] = ['string', 'number', 'boolean', 'date'];
        return {
            name: faker.lorem.word(),
            type: faker.helpers.arrayElement(fieldTypes),
            required: faker.datatype.boolean(),
            description: faker.lorem.sentence(),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        };
    }

    private static generateItem(fields: Field[]): Item {
        const values: Record<string, any> = {};
        
        fields.forEach(field => {
            switch (field.type) {
                case 'string':
                    values[field.name] = faker.lorem.word();
                    break;
                case 'number':
                    values[field.name] = faker.number.int({ min: 1, max: 1000 });
                    break;
                case 'boolean':
                    values[field.name] = faker.datatype.boolean();
                    break;
                case 'date':
                    values[field.name] = faker.date.past();
                    break;
            }
        });

        return {
            values,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        };
    }

    private static generateTable(isShallow: boolean = false): Table {
        const fieldCount = faker.number.int({ min: 3, max: 8 });
        const fields = isShallow ? [] : Array.from({ length: fieldCount }, () => this.generateField());
        
        const items = isShallow ? [] : Array.from(
            { length: faker.number.int({ min: 5, max: 20 }) }, 
            () => this.generateItem(fields)
        );

        return {
            name: faker.lorem.words(2),
            description: faker.lorem.sentence(),
            fields,
            items,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        };
    }

    private static generateWorkbook(isShallow: boolean = false): Workbook {
        const tables = isShallow ? [] : Array.from(
            { length: faker.number.int({ min: 1, max: 5 }) }, 
            () => this.generateTable(isShallow)
        );

        return {
            name: faker.lorem.words(2),
            description: faker.lorem.sentence(),
            tables,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        };
    }

    static generateUser(isShallow: boolean = false): User {
        const workbooks = isShallow ? [] : Array.from(
            { length: faker.number.int({ min: 1, max: 3 }) }, 
            () => this.generateWorkbook(isShallow)
        );

        return {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            workbooks,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        };
    }

    static generateUsers(count: number = 1, isShallow: boolean = false): User[] {
        return Array.from({ length: count }, () => this.generateUser(isShallow));
    }
} 