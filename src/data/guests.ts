// src/data/guests.ts
import { Guest } from '@/types';

const firstNames = [
  "Alice", "Bob", "Carla", "David", "Emma", "Félix", "Gina", "Hugo",
  "Inès", "Jules", "Karim", "Laura", "Mehdi", "Nina", "Oscar", "Paul",
  "Quentin", "Rania", "Sophie", "Tom", "Ugo", "Valérie", "William", "Xena",
  "Yasmine", "Ziad", "Amira", "Benoît", "Chloé", "Dylan", "Élodie", "Farid",
  "Gaël", "Hana", "Idriss", "Joanna", "Kenza", "Léo", "Manon", "Noah",
  "Océane", "Pierre", "Quitterie", "Rayan", "Salomé", "Tarek", "Ursule", "Victor",
  "Wassim", "Xavier", "Yara", "Zoé", "Anis", "Baya", "Camille", "Djamal",
  "Émile", "Fatima", "Géraldine", "Hamid", "Imane", "Jean", "Kamil", "Lina",
  "Malik", "Nadia", "Omar", "Patricia", "Quoc", "Rachid", "Sabrina", "Théo",
  "Ugo", "Vanessa", "Wafa", "Xheni", "Younes", "Zohra"
];

export const guests: Guest[] = firstNames.map((name, index) => ({
  id: index + 1,
  name,
  tableId: Math.floor(index / 4) + 1,
}));
