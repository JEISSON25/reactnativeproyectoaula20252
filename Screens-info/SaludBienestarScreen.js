import { ScrollView, StyleSheet, Text, View } from "react-native";

const SaludBienestarScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Salud y Bienestar</Text>

      {/* Dormir bien */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Dormir bien</Text>
        <Text style={styles.text}>
          Duerme entre 7 y 9 horas diarias para recuperación muscular y mental.{"\n"}
          Establece una rutina de sueño.{"\n"}
          Evita pantallas brillantes antes de dormir.{"\n"}
          Mantén tu habitación oscura y fresca.
        </Text>
      </View>

      {/* Hidratación */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Hidratación</Text>
        <Text style={styles.text}>
          Bebe al menos 2 litros de agua al día para mantener el rendimiento y la
          concentración.{"\n"}
          Aumenta la ingesta si entrenas intensamente.{"\n"}
          Incluye infusiones sin azúcar y frutas ricas en agua como sandía y pepino.
        </Text>
      </View>

      {/* Manejo del estrés */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Manejo del estrés</Text>
        <Text style={styles.text}>
          Practica meditación, respiración o actividades recreativas.{"\n"}
          Dedica al menos 10 minutos diarios a relajarte.{"\n"}
          Caminar al aire libre también ayuda a reducir tensiones.
        </Text>
      </View>

      {/* Ejercicio y movimiento */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Actividad física regular</Text>
        <Text style={styles.text}>
          El ejercicio no solo mejora tu cuerpo, también tu mente.{"\n"}
          Haz entrenamientos de fuerza 2-4 veces por semana.{"\n"}
          Combínalos con actividad cardiovascular y estiramientos.{"\n"}
          Muévete cada hora si pasas mucho tiempo sentado.
        </Text>
      </View>

      {/* Alimentación equilibrada */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Alimentación equilibrada</Text>
        <Text style={styles.text}>
          Una buena nutrición es clave para sentirte bien.{"\n"}
          Incluye frutas, verduras, proteínas magras y carbohidratos integrales.{"\n"}
          Limita azúcares refinados y alimentos ultraprocesados.{"\n"}
          Mantén horarios regulares de comida.
        </Text>
      </View>

      {/* Higiene postural */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Higiene postural</Text>
        <Text style={styles.text}>
          Mantén una postura correcta en tu día a día.{"\n"}
          Ajusta la altura de tu silla y pantalla al trabajar.{"\n"}
          Evita encorvarte al caminar o cargar peso.{"\n"}
          Haz pausas para estirar durante la jornada.
        </Text>
      </View>

      {/* Chequeos médicos */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Chequeos médicos</Text>
        <Text style={styles.text}>
          No descuides tu salud preventiva.{"\n"}
          Hazte análisis de rutina al menos una vez al año.{"\n"}
          Consulta con un médico o nutricionista antes de iniciar cambios drásticos.
        </Text>
      </View>

      {/* Bienestar emocional */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Bienestar emocional</Text>
        <Text style={styles.text}>
          Tu mente también necesita cuidados.{"\n"}
          Pasa tiempo con amigos y familia.{"\n"}
          Dedica tiempo a tus hobbies.{"\n"}
          No tengas miedo de pedir ayuda profesional si lo necesitas.
        </Text>
      </View>

      {/* Mensaje motivador final */}
      <View style={styles.cardHighlight}>
        <Text style={styles.textHighlight}>
          El verdadero bienestar es un equilibrio entre cuerpo, mente y emociones.{"\n\n"}
          <Text style={styles.highlight}>Trainfo</Text> está contigo en cada paso,
          ayudándote a entrenar mejor, alimentarte con conciencia y cuidar tu salud
          de forma integral. 
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

export default SaludBienestarScreen;
