import Colors from "@/constants/Colors";
import { useOAuth, useSignUp, useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";

// https://github.com/clerkinc/clerk-expo-starter/blob/main/components/OAuth.tsx
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { defaultStyles } from "@/constants/Styles";
import { useState } from "react";
import TextButton from "@/components/TextButton";

enum Strategy {
  Google = "oauth_google",
  Apple = "oauth_apple",
  Facebook = "oauth_facebook",
}
const Page = () => {
  // Warm up the browser to avoid a delay when the user clicks the button
  useWarmUpBrowser();

  const router = useRouter();
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  const { startOAuthFlow: facebookAuth } = useOAuth({
    strategy: "oauth_facebook",
  });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const [proceed, setProceed] = useState<boolean>(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const onSelectAuth = async (strategy: Strategy) => {
    const selectedAuth = {
      [Strategy.Google]: googleAuth,
      [Strategy.Apple]: appleAuth,
      [Strategy.Facebook]: facebookAuth,
    }[strategy];

    try {
      const { createdSessionId, setActive } = await selectedAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.back();
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  const onContinue = async () => {
    if (!isLoaded) {
      return;
    }
    if (!proceed) {
      setProceed(true);
    } else {
      try {
        await signUp.create({
          emailAddress: email,
          password: password,
        });
        // send the email.
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        // change the UI to our pending section.
        setPendingVerification(true);
      } catch (err: any) {
        console.log(`Try signup error: ${JSON.stringify(err, null, 2)}`);
        if (err.errors.some((e: any) => e.code === "form_identifier_exists")) {
          try {
            const completeSignIn = await signIn?.create({
              identifier: email,
              password,
            });
            await setActive({ session: completeSignIn?.createdSessionId }).then(
              () => router.back()
            );
          } catch (err: any) {
            console.log(JSON.stringify(err, null, 2));
            setErrorText(err.errors[0].message);
          }
        } else {
          console.log(JSON.stringify(err, null, 2));
          setErrorText(err.errors[0].message);
        }
      }
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log(`completeSignUp: ${JSON.stringify(completeSignUp, null, 2)}`);

      await setActive({ session: completeSignUp.createdSessionId }).then(() => {
        console.log(
          `Signed in with createSessionId = ${completeSignUp.createdSessionId}`
        );
        router.back();
      });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.container}>
      {!pendingVerification && (
        <View>
          <TextInput
            autoCapitalize="none"
            placeholder="Email"
            style={[defaultStyles.inputField, { marginBottom: 30 }]}
            onChangeText={setEmail}
            inputMode="email"
          />

          {proceed ? (
            <TextInput
              autoCapitalize="none"
              placeholder="Password"
              style={[
                defaultStyles.inputField,
                { marginBottom: errorText ? 8 : 30 },
              ]}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
          ) : null}

          {errorText ? (
            <Text style={{ color: "red", fontSize: 12, marginBottom: 12 }}>
              {errorText}
            </Text>
          ) : null}

          <TextButton onPress={onContinue} title="Continue" />

          {/** TODO: Add Sign up / Log in button based on email address exists */}

          <View style={styles.seperatorView}>
            <View
              style={{
                flex: 1,
                borderBottomColor: "black",
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            <Text style={styles.seperator}>or</Text>
            <View
              style={{
                flex: 1,
                borderBottomColor: "black",
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
          </View>

          <View style={{ gap: 20 }}>
            <TouchableOpacity style={styles.btnOutline}>
              <Ionicons
                name="mail-outline"
                size={24}
                style={defaultStyles.btnIcon}
              />
              <Text style={styles.btnOutlineText}>Continue with Phone</Text>
            </TouchableOpacity>

            {Platform.OS == "ios" ? (
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => onSelectAuth(Strategy.Apple)}
              >
                <Ionicons
                  name="md-logo-apple"
                  size={24}
                  style={defaultStyles.btnIcon}
                />
                <Text style={styles.btnOutlineText}>Continue with Apple</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => onSelectAuth(Strategy.Google)}
            >
              <Ionicons
                name="md-logo-google"
                size={24}
                style={defaultStyles.btnIcon}
              />
              <Text style={styles.btnOutlineText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {pendingVerification && (
        <View style={styles.pendingVerificationContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              value={code}
              placeholder="Code..."
              onChangeText={setCode}
              style={styles.input}
            />
          </View>
          <TouchableOpacity onPress={onPressVerify} style={defaultStyles.btn}>
            <Text style={styles.verifyButtonText}>Verify Email</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 26,
  },

  seperatorView: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginVertical: 30,
  },
  seperator: {
    fontFamily: "mon-sb",
    color: Colors.grey,
    fontSize: 16,
  },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.grey,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  btnOutlineText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "mon-sb",
  },
  pendingVerificationContainer: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
  },
  verifyButton: {
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  verifyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
