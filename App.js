import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [image, setImage] = useState();
  const [compressed, setCompressed] = useState();
  const [responseText, setResponseText] = useState("");
  const [headerText, setHeaderText] = useState(
    "Waiting for image to be scanned...",
  );

  const checkIngredients = async () => {
    if (!compressed) {
      alert("No image to check. Please take a picture first.");
      return;
    }

    try {
      const isJainResponse = await fetch(
        "https://jain-server.vercel.app/isjain",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            base64Image: compressed,
          }),
        },
      );

      if (!isJainResponse.ok) {
        console.log("API error: ", await isJainResponse.text());
        throw new Error("API request failed");
      }

      const jsonResponse = await isJainResponse.json();
      const isJainExplanation =
        jsonResponse.response || "No response field in API";
      console.log(isJainExplanation);
      processResponse(isJainExplanation);
    } catch (error) {
      alert("Error checking ingredients: " + error.message);
    }
  };

  const processResponse = (responseText) => {
    const parts = responseText.split(".");

    const firstSentence = parts[0].trim();
    setHeaderText(
      firstSentence === "YES"
        ? "This is Jain-friendly!"
        : "This may not be Jain-friendly",
    );

    const explanation = parts.length > 1 ? parts.slice(1).join(".").trim() : "";
    setResponseText(explanation);
  };

  const checkPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return false;
    }
    return true;
  };

  const takePic = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return; // Exit if no permission

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled) {
        await saveImage(result.assets[0].uri, result.assets[0].base64);
      }
    } catch (error) {
      alert("Error uploading image: " + error.message);
    }
  };

  const saveImage = async (uri, compressed) => {
    try {
      //update displayed image
      setImage(uri);
      setCompressed("data:image/jpeg;base64," + compressed);
    } catch (error) {
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/*View for the header*/}
      <View style={styles.header}>
        <Text style={styles.title}>Jain Scan</Text>
      </View>

      {/*View for the ImagePicker*/}
      <View style={styles.image}>
        <TouchableOpacity onPress={takePic} style={styles.button}>
          <Text style={styles.textPicker}>Scan Ingredients</Text>
        </TouchableOpacity>

        <Image style={styles.pic} source={{ uri: image }}></Image>
      </View>

      {/*View for the Results*/}
      <View style={styles.results}>
        <TouchableOpacity onPress={checkIngredients} style={styles.button}>
          <Text style={styles.textPicker}>Check ingredients</Text>
        </TouchableOpacity>

        <Text style={styles.textResultHead}>{headerText}</Text>
        <Text style={styles.textResultExplain}>{responseText}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9C77E",
    alignItems: "stretch",
    justifyContent: "center",
    flexDirection: "column",
  },
  header: {
    paddingVertical: 20,
    backgroundColor: "#F9C77E",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    marginBottom: 20,
    backgroundColor: "#F9C77E",
    alignItems: "center",
  },
  results: {
    backgroundColor: "#F9C77E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  title: {
    color: "#DA2E00",
    fontSize: 40,
    margin: 5,
    fontWeight: "bold",
    fontFamily: "PingFangTC-Medium",
  },
  textPicker: {
    color: "#FFEBCC",
    fontSize: 15,
    textAlign: "center",
  },
  textResultHead: {
    color: "#7A2A2A",
    fontSize: 20,
  },
  textResultExplain: {
    color: "#7A2A2A",
    fontSize: 15,
    marginTop: 20,
    textAlign: "center",
    maxWidth: "90%",
  },
  pic: {
    width: 250,
    height: 250,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#DA2E00",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, // Offset for the shadow
    shadowOpacity: 0.28,
    shadowRadius: 6,
    marginBottom: 20,
    alignSelf: "center",
  },
});
