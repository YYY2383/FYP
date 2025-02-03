import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const recipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  } else if (req.method === "POST") {
    try {
      const newRecipe = req.body;
      await addDoc(collection(db, "recipes"), newRecipe);
      res.status(201).json({ message: "Recipe added!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to add recipe" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
