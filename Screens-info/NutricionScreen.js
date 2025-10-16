import { ScrollView, StyleSheet, Text, View } from "react-native";

const NutricionScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nutrición</Text>

      {/* Plan de comidas */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Plan de comidas</Text>
        <Text style={styles.text}>
          Incluye proteínas, carbohidratos y grasas saludables en cada comida.{"\n"}
          Ejemplo: pollo, arroz integral, vegetales y aguacate.
        </Text>
      </View>

      {/* Snacks saludables */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Snacks saludables</Text>
        <Text style={styles.text}>
          Opta por frutas frescas, frutos secos, yogur natural o barras de
          proteína para mantener tu energía estable durante el día.
        </Text>
      </View>

      {/* Suplementos */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Suplementos</Text>
        <Text style={styles.text}>
          Puedes incluir proteína en polvo, creatina y vitaminas, siempre según
          tus necesidades y bajo recomendación profesional.
        </Text>
      </View>

      {/* Recomendaciones según somatotipo */}
      <Text style={styles.sectionTitle}>Recomendaciones según tu tipo de cuerpo</Text>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Ectomorfo</Text>
        <Text style={styles.text}>
          Los ectomorfos suelen tener metabolismo rápido y les cuesta ganar peso.{"\n"}
          Come más calorías de lo normal, priorizando carbohidratos complejos 
          (arroz, pasta, avena) y proteínas magras (pollo, pescado, huevos).{"\n"}
          Añade snacks calóricos como frutos secos, mantequilla de maní y batidos
          de avena con leche.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Mesomorfo</Text>
        <Text style={styles.text}>
          Los mesomorfos tienen facilidad para ganar músculo y mantenerse definidos.{"\n"}
          Dieta balanceada: 40% carbohidratos, 30% proteínas, 30% grasas.{"\n"}
          Buenas opciones: carnes magras, arroz integral, vegetales, aguacate y
          aceite de oliva.{"\n"}
          Controla las porciones para evitar acumular grasa.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Endomorfo</Text>
        <Text style={styles.text}>
          Los endomorfos tienden a ganar peso con facilidad, por lo que deben cuidar 
          la cantidad de carbohidratos.{"\n"}
          Prioriza proteínas (pollo, pescado, claras de huevo) y vegetales en cada comida.{"\n"}
          Prefiere carbohidratos de bajo índice glucémico (batata, quinoa, lentejas).{"\n"}
          Reduce azúcares simples y aumenta la actividad cardiovascular.
        </Text>
      </View>

      <View style={styles.cardHighlight}>
        <Text style={styles.textHighlight}>
           Recuerda: la nutrición es tan importante como el entrenamiento.{"\n\n"}
          <Text style={styles.highlight}>Trainfo</Text> te ayuda a encontrar el
          equilibrio perfecto entre ejercicio y alimentación para lograr tus metas.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B00",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#E5E5EA",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHighlight: {
    backgroundColor: "#FF6B00",
    padding: 20,
    borderRadius: 16,
    marginVertical: 25,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  textHighlight: {
    fontSize: 16,
    color: "#121212",
    lineHeight: 22,
    fontWeight: "500",
  },
  highlight: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#121212",
  },
});

export default NutricionScreen;
