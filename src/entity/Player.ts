import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToMany,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { Match } from "./Match";

@ObjectType()
@Entity()
export class Player extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    firstName: string;

    @Field()
    @Column()
    lastName: string;

    @Field()
    @Column()
    birthDate: Date;

    @Field(() => [Match])
    @ManyToMany(() => Match, match => match.players)
    matches: Match[];
}
