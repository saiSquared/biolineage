import { Card } from "./Shapes/Card";
import { ImgCard } from "./Shapes/ImgCard";
import { TextShape } from "./Shapes/TextShape";
import { TopicShape } from "./Shapes/TopicShape";
import { TaskShape } from "./Shapes/Task";
import { Milestone } from "./Shapes/Milestone";
export declare const shapes: {
    card: typeof Card;
    "img-card": typeof ImgCard;
    text: typeof TextShape;
    topic: typeof TopicShape;
    task: typeof TaskShape;
    milestone: typeof Milestone;
};
export declare function createShape(item: any, context: any): any;
