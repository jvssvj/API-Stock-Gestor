import { v4 as uuidv4 } from "uuid";
import { HttpError } from "../errors/HttpError";
import { z } from "zod";

interface Item {
  id: string;
  image: string;
  name: string;
  description: string;
  quantity: number;
  priceInCents: number;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  sku: string;
}

export const createItemSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter 3+ caracteres")
    .nonempty("O nome do item é obrigatório."),
  description: z.string().min(3, "Descrição muito curta."),
  quantity: z.number().int().min(1, "Precisa de no mínimo uma unidade."),
  priceInCents: z
    .number()
    .int()
    .nonnegative("O preço precisa ser maior ou igual a 0."),
  category: z.string().nonempty("A categoria é obrigatória."),
  sku: z.string().nonempty("O código SKU é obrigatório."),
  image: z
    .string()
    .url("URL da imagem inválida.")
    .optional()
    .default("default.jpg"),
});

export const updateItemSchema = createItemSchema.partial();

let items: Item[] = [
  {
    id: "418ea5d7-9e35-45ae-aca6-9aad9137b288",
    name: "Teste criado manual",
    description: "Descrição do item",
    quantity: 1,
    priceInCents: 2,
    category: "Informatica",
    sku: "23232332-3",
    image: "http://teste.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const itemService = {
  findAll: () => {
    if (items.length === 0 || !items) {
      throw new HttpError(404, "Nenhum item em estoque.");
    }

    return items;
  },
  create: (item: unknown) => {
    const validatedData = createItemSchema.parse(item);

    const newItem: Item = {
      id: uuidv4(),
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    items.push(newItem);

    return newItem;
  },

  findById(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) throw new HttpError(404, "Item não encontrado.");
    return item;
  },

  update(id: string, data: unknown) {
    const itemIndex = items.findIndex((i) => i.id === id);
    if (itemIndex === -1) throw new HttpError(404, "Item não encontrado.");

    const validatedData = updateItemSchema.parse(data);

    const updatedItem: Item = {
      ...items[itemIndex],
      ...validatedData,
      updatedAt: new Date(),
    };

    items[itemIndex] = updatedItem;

    return updatedItem;
  },

  delete(id: string) {
    const itemDeleted = items.filter((i) => i.id !== id);
    items = itemDeleted;
    return itemDeleted;
  },
};

export default itemService;
