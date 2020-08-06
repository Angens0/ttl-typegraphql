import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { Match } from "./Match";

export enum UserRole {
    ADMIN = "admin",
    TABLE = "table",
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Column()
    password: string;

    @Field(() => UserRole)
    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.TABLE,
    })
    role: UserRole;

    @Field(() => [Match])
    @OneToMany(() => Match, match => match.table)
    matches: Promise<Match[]>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    isTable(): boolean {
        return this.role === UserRole.TABLE;
    }

    async getOgnoingMatch(): Promise<Match> | null {
        if (!this.isTable()) {
            throw new Error("Table not found");
        }

        const matches = await Match.getOngoingMatches();
        for (let i = 0; i < matches.length; i++) {
            const table = await matches[i].table;
            if (table.id === this.id) {
                return matches[i];
            }
        }

        return null;
    }
}
