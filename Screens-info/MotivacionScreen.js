import { ScrollView, StyleSheet, Text, View } from "react-native";

const MotivacionScreen = () => {
  const frases = [
    "El éxito no se logra de la noche a la mañana, pero cada día cuenta.",
    "No pares cuando estés cansado, para cuando hayas terminado.",
    "Hazlo por ti, no por los demás.",
    "La constancia vence al talento cuando el talento no trabaja duro.",
    "Cada repetición cuenta, cada paso suma.",
    "Recuerda que la disciplina supera a la motivación: habrá días difíciles, pero esos días construyen tu verdadera fortaleza.",
    "No necesitas compararte con nadie, tu única competencia eres tú mismo ayer.",
    "El gimnasio no solo cambia tu cuerpo, también tu mente, tu confianza y tu manera de enfrentar la vida.",
    "Si esperas el momento perfecto nunca llegará. Empieza hoy, aunque sea con poco.",
    "Cada gota de sudor es una inversión en la mejor versión de ti mismo.",
  ];

  const consejos = [
    " Establece metas claras: no solo pienses en 'quiero estar en forma', define plazos y objetivos medibles.",
    " Celebra los pequeños logros: subir un poco más de peso, correr más tiempo o simplemente haber sido constante una semana.",
    " Rodéate de personas que te inspiren: la energía positiva es contagiosa.",
    " Recuerda que el progreso es lento, pero seguro. Incluso los campeones empezaron desde cero.",
    " No te castigues si fallas un día: lo importante es levantarte y seguir.",
    " Haz del entrenamiento un hábito, no una obligación. Encuentra rutinas que disfrutes.",
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Motivación</Text>

      {frases.map((frase, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.text}>{frase}</Text>
        </View>
      ))}

      <Text style={styles.title}>Consejos para tu progreso</Text>
      {consejos.map((consejo, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.text}>{consejo}</Text>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.text}>
          El camino del gimnasio no se trata solo de levantar pesas, se trata de
          superarte cada día. Al entrenar, no solo fortaleces tu cuerpo, sino que
          también entrenas tu mente para ser más disciplinada, enfocada y resistente
          ante los retos de la vida.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.text}>
          Cada sesión cuenta, incluso las más pequeñas. No subestimes el poder de la
          constancia: entrenar 20 minutos hoy vale más que esperar a “mañana” y no
          hacerlo nunca. Tu futuro yo agradecerá cada esfuerzo de tu presente.
        </Text>
      </View>

      <View style={styles.cardHighlight}>
        <Text style={styles.text}>
           Y recuerda: no estás solo en este proceso.{"\n\n"}
          <Text style={styles.highlight}>Trainfo</Text> es una app que te apoya en tu
          camino, motivándote y dándote las herramientas necesarias para lograr esa
          mejor versión de ti.
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
  text: {
    fontSize: 18,
    color: "#E5E5EA",
    lineHeight: 24,
  },
  highlight: {
    fontWeight: "bold",
    color: "#121212",
  },
});

export default MotivacionScreen;
