import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { rechercherParVille } from "../../../api/simule";
import LogementCard from "../../../components/LogementCard";
import { useFavorisStore } from "../../../store/favorisStore";
import { useLogementsStore } from "../../../store/logementsStore";

export default function HomeScreen() {
  const { favoris, addFavoris, removeFavoris } = useFavorisStore();
  const { statut, logements, erreur, charger } = useLogementsStore();
  const [croissant, setCroissant] = useState(true);
  const [ville, setVille] = useState("");
  const [resultats, setResultats] = useState([]);

  // Marquer / démarquer un logement par son ID
  function toggleMarque(id) {
    if (favoris.includes(id)) {
      removeFavoris(id);
    } else {
      addFavoris(id);
    }
  }

  useEffect(() => {
    if (ville === "") {
      setResultats(logements); // pas de filtre : tout afficher
      return;
    }
    // Délai imposé pour provoquer une réponse tardive : Rennes lent, le reste rapide
    const delai = ville === "Rennes" ? 1500 : 500;
    // Volontairement sans garde : la réponse tardive de Rennes écrase celle de
    // Nantes, c'est le bug de concurrence que l'exercice E3.2 doit montrer.
    rechercherParVille(ville, delai).then(setResultats);
  }, [ville, logements]);

  const logementsAffiches = [...resultats].sort((a, b) =>
    croissant ? a.price - b.price : b.price - a.price,
  );

  if (statut === "chargement") {
    return (
      <SafeAreaView style={[styles.container, styles.centre]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </SafeAreaView>
    );
  }

  if (statut === "vide") {
    return (
      <SafeAreaView style={[styles.container, styles.centre]}>
        <Text style={styles.message}>
          Aucun logement disponible pour le moment.
        </Text>
      </SafeAreaView>
    );
  }

  if (statut === "erreur") {
    return (
      <SafeAreaView style={[styles.container, styles.centre]}>
        <Text style={styles.message}>Erreur : {erreur}</Text>
        <Pressable onPress={() => charger()} style={styles.bouton}>
          <Text style={styles.boutonTexte}>Réessayer</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Link href="/modal">Open modal</Link>

      <TextInput
        style={styles.input}
        placeholder="Rechercher une ville"
        value={ville}
        onChangeText={setVille}
      />
      <Pressable onPress={() => setVille("")}>
        <Text>Effacer la recherche</Text>
      </Pressable>
      <Pressable onPress={() => setVille("Rennes")}>
        <Text>Rennes</Text>
      </Pressable>
      <Pressable onPress={() => setVille("Nantes")}>
        <Text>Nantes</Text>
      </Pressable>
      <Pressable onPress={() => setCroissant(!croissant)} style={styles.bouton}>
        <Text style={styles.boutonTexte}>
          Trier par prix {croissant ? "décroissant" : "croissant"}
        </Text>
      </Pressable>

      <FlatList
        data={logementsAffiches}
        keyExtractor={(logement) => logement.id}
        ListEmptyComponent={
          <Text style={styles.message}>Aucun logement trouvé.</Text>
        }
        renderItem={({ item }) => (
          <LogementCard
            logement={item}
            marque={favoris.includes(item.id)}
            onToggle={() => toggleMarque(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  centre: { justifyContent: "center", alignItems: "center" },
  message: { textAlign: "center", color: "#777", marginVertical: 12 },
  bouton: {
    backgroundColor: "#FF5A5F",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  boutonTexte: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});
