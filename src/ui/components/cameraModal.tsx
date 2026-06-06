import { useTheme } from "@/src/theme/useTheme";
import { Step } from "@/src/types/types";
import * as ImagePicker from "expo-image-picker";
import { extractTextFromImage, isSupported } from "expo-text-extractor";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  onClose: () => void;
  onApply: (text: string) => void;
};

export default function CameraModal({ onClose, onApply }: Props) {
  const t = useTheme();

  const [step, setStep] = useState(Step.idle);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [recognizedText, setRecognizedText] = useState<string[]>([]);
  const [editedText, setEditedText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const processImage = async (path: string) => {
    setStep(Step.processing);

    const fakeText = "// OCR disabled\nconsole.log('Hello from image');";

    onApply(fakeText);
    onClose();

    setErrorMessage("");

    if (!isSupported) {
      setErrorMessage("Text extraction is not supported on this device");
      setStep(Step.error);
      return;
    }

    try {
      const extractedTexts = await extractTextFromImage(path);
      setRecognizedText(extractedTexts);

      const fullText = extractedTexts.join("\n");
      setEditedText(fullText);

      onApply(fullText);
      setStep(Step.review);
      onClose();
    } catch (error) {
      setErrorMessage("Text Extraction Error");
      setStep(Step.error);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setErrorMessage("Permission to access the media library is required.");
      setStep(Step.error);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      const path = result.assets[0].uri;
      setSelectedImage(path);
      setStep(Step.preview);
      await processImage(path);
    }
  };

  return (
    <Modal animationType="slide" transparent={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: t.bg,
          paddingTop: 56,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? t.surfaceLiteFocus : t.surfaceLite,
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
            })}
          >
            <Text
              style={{
                color: t.text,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              ←
            </Text>
          </Pressable>

          <Text
            style={{
              color: t.text,
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            Scan Code
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: t.text,
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Import code from photo
          </Text>

          <Text
            style={{
              color: t.textSecondary,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Take a photo or choose one from your gallery. You will be able to
            review and edit the recognized text before replacing the code in
            your post.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: t.surfaceLite,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: t.surfaceFocus,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: 1,
              borderColor: t.surfaceLiteFocus,
            }}
          >
            <Text style={{ fontSize: 30 }}>📷</Text>
          </View>

          <Text
            style={{
              color: t.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            OCR Scanner
          </Text>

          <Text
            style={{
              color: t.textSecondary,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Best results come from clear photos with good lighting, straight
            framing, and visible code lines.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: t.surfaceFocus,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: t.surfaceLiteFocus,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: t.text,
              fontSize: 15,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Tips for better recognition
          </Text>

          <Text
            style={{
              color: t.textSecondary,
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            • Keep the camera straight{"\n"}• Avoid blur and glare{"\n"}• Make
            sure the full code block is visible{"\n"}• Use good lighting
          </Text>
        </View>

        {errorMessage ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#ff6b6b", fontSize: 13 }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: "auto", gap: 12 }}>
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? t.secondaryHover : t.secondary,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
            })}
            onPress={pickImage}
          >
            <Text
              style={{
                color: t.textButtons,
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              Choose from Gallery
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
