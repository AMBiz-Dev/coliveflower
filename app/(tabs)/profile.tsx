import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { defaultStyles } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const Page = () => {
  const { isLoaded, signOut, isSignedIn } = useAuth();
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName);
  const [lastName, setLastName] = useState(user?.lastName);
  const [edit, setEdit] = useState(false);
  const router = useRouter();

  // Automatically open login if user is not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      console.log("Profile -> Login: User not signed in!");
      router.push("/(modals)/login");
    }
  }, [isLoaded]);

  const getDefaultDOB = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  };

  const getDateFromString = (
    dateString: string | unknown,
    defaultDate: Date = new Date()
  ) => {
    if (!dateString || typeof dateString !== "string") {
      return defaultDate;
    }
    const dateSplit = dateString.split("/");
    return new Date(
      parseInt(dateSplit[2]),
      parseInt(dateSplit[1]) - 1,
      parseInt(dateSplit[0])
    );
  };

  // Additional state variables for the requested information
  const [membershipStart, setMembershipStart] = useState<Date>(new Date());
  const [membershipExpiry, setMembershipExpiry] = useState<Date>(new Date());
  const [dateOfBirth, setDateOfBirth] = useState<Date>(getDefaultDOB());
  const [propertyAddress, setPropertyAddress] = useState("");
  const [bookingFee, setBookingFee] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [membershipTier, setMembershipTier] = useState("");
  const [paymentInformation, setPaymentInformation] = useState("");
  const [nationality, setNationality] = useState("");
  const [id, setId] = useState("");
  const [employmentPassDetails, setEmploymentPassDetails] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [religion, setReligion] = useState("");
  const [occupation, setOccupation] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user.firstName);
    setLastName(user.lastName);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setMembershipStart(
      getDateFromString(user?.unsafeMetadata?.membershipStart)
    );
    setMembershipExpiry(
      getDateFromString(user?.unsafeMetadata?.membershipExpiry)
    );
    setPropertyAddress((user?.unsafeMetadata?.propertyAddress || "") as string);
    setBookingFee(
      (user?.unsafeMetadata?.bookingFee?.toString() || "0") as string
    );
    setSecurityDeposit(
      (user?.unsafeMetadata?.securityDeposit?.toString() || "0") as string
    );
    setMembershipTier((user?.unsafeMetadata?.membershipTier || "") as string);
    setPaymentInformation(
      (user?.unsafeMetadata?.paymentInformation || "") as string
    );
    setNationality((user?.unsafeMetadata?.nationality || "") as string);
    setId((user?.unsafeMetadata?.id || "") as string);
    setEmploymentPassDetails(
      (user?.unsafeMetadata?.employmentPassDetails || "") as string
    );
    setDateOfBirth(
      getDateFromString(user?.unsafeMetadata?.dateOfBirth, getDefaultDOB())
    );
    setGender((user?.unsafeMetadata?.gender || "Male") as string);
    setRace((user?.unsafeMetadata?.race || "") as string);
    setReligion((user?.unsafeMetadata?.religion || "") as string);
    setOccupation((user?.unsafeMetadata?.occupation || "") as string);
    setMobileNumber((user?.unsafeMetadata?.mobileNumber || "") as string);
  }, [user]);

  // Capture image from camera roll
  // Upload to Clerk as avatar
  const onCaptureImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = `data:image/png;base64,${result.assets[0].base64}`;
      user?.setProfileImage({
        file: base64,
      });
    }
  };

  const [previousState, setPreviousState] = useState<any>(null);

  // Function to save the current state as the previous state
  const savePreviousState = () => {
    setPreviousState({
      firstName,
      lastName,
      membershipStart,
      membershipExpiry,
      propertyAddress,
      bookingFee,
      securityDeposit,
      membershipTier,
      paymentInformation,
      nationality,
      id,
      employmentPassDetails,
      dateOfBirth,
      gender,
      race,
      religion,
      occupation,
      mobileNumber,
    });
  };

  // Function to undo the changes and revert back to the previous state
  const undoChanges = () => {
    if (previousState) {
      setFirstName(previousState.firstName);
      setLastName(previousState.lastName);
      setMembershipStart(previousState.membershipStart);
      setMembershipExpiry(previousState.membershipExpiry);
      setPropertyAddress(previousState.propertyAddress);
      setBookingFee(previousState.bookingFee);
      setSecurityDeposit(previousState.securityDeposit);
      setMembershipTier(previousState.membershipTier);
      setPaymentInformation(previousState.paymentInformation);
      setNationality(previousState.nationality);
      setId(previousState.id);
      setEmploymentPassDetails(previousState.employmentPassDetails);
      setDateOfBirth(previousState.dateOfBirth);
      setGender(previousState.gender);
      setRace(previousState.race);
      setReligion(previousState.religion);
      setOccupation(previousState.occupation);
      setMobileNumber(previousState.mobileNumber);
    }
  };

  const onEdit = () => {
    savePreviousState();
    setEdit(true);
  };

  const onCancel = () => {
    undoChanges();
    setEdit(false);
  };

  const onSave = () => {
    // validate fields

    // Save data on clerk's user metadata
    try {
      user?.update({
        unsafeMetadata: {
          firstName,
          lastName,
          membershipStart: membershipStart.toLocaleString("en-GB").slice(0, 10), // date
          membershipExpiry: membershipExpiry
            .toLocaleString("en-GB")
            .slice(0, 10), // date
          dateOfBirth: dateOfBirth.toLocaleString("en-GB").slice(0, 10), // date
          propertyAddress,
          bookingFee: parseInt(bookingFee),
          securityDeposit: parseInt(securityDeposit),
          membershipTier,
          paymentInformation,
          nationality,
          id,
          employmentPassDetails,
          gender,
          race,
          religion,
          occupation,
          mobileNumber,
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setEdit(false);
    }
  };

  const login = () => {
    router.push("/(modals)/login");
  };

  return (
    <SafeAreaView style={defaultStyles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Profile</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {isSignedIn ? (
            <TouchableOpacity
              style={{
                outlineColor: "black",
                borderRadius: 12,
                borderColor: "black",
                borderWidth: 2,
                paddingHorizontal: 4,
              }}
              onPress={() => signOut()}
            >
              <Text style={{ textAlignVertical: "center" }}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                outlineColor: "black",
                borderRadius: 12,
                borderColor: "black",
                borderWidth: 2,
                paddingHorizontal: 4,
              }}
              onPress={login}
            >
              <Text style={{ textAlignVertical: "center" }}>Login</Text>
            </TouchableOpacity>
          )}
          <Ionicons style={{marginLeft: 4}} name="notifications-outline" size={26} />
        </View>
      </View>

      {user && (
        <View style={styles.card}>
          {edit && (
            <TouchableOpacity style={{ position: "absolute", top: 8, left: 8 }}>
              <Ionicons
                name="close-circle-outline"
                size={24}
                style={{ color: "grey" }}
                onPress={onCancel}
              />
            </TouchableOpacity>
          )}
          {isSignedIn ? (
            <View style={{ position: "absolute", top: 8, right: 16 }}>
              <Text>
                {(user?.unsafeMetadata?.access as string) ?? "Member"}
              </Text>
            </View>
          ) : null}
          <TouchableOpacity onPress={onCaptureImage}>
            <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "column",
              gap: 6,
              alignItems: "flex-start",
            }}
          >
            <View style={{ alignSelf: "center" }}>
              <View style={styles.nameLabel}>
                <Text style={{ fontFamily: "mon-b", fontSize: 22 }}>
                  {firstName} {lastName}
                </Text>
                {!edit && (
                  <TouchableOpacity onPress={onEdit}>
                    <Ionicons
                      name="create-outline"
                      size={24}
                      color={Colors.dark}
                    />
                  </TouchableOpacity>
                )}
                {edit && (
                  <TouchableOpacity onPress={onSave}>
                    <Ionicons
                      name="save-outline"
                      size={24}
                      color={Colors.dark}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {edit && (
              <ScrollView
                style={styles.editColumn}
                contentContainerStyle={styles.scrollViewContent}
              >
                <View style={styles.dateRow}>
                  <Text style={styles.label}>Membership Start</Text>
                  <DateTimePicker
                    value={membershipStart}
                    mode="date"
                    onChange={(_, selectedDate) =>
                      setMembershipStart(selectedDate!)
                    }
                  />
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.label}>Membership Expiry</Text>
                  <DateTimePicker
                    value={membershipExpiry}
                    mode="date"
                    onChange={(_, selectedDate) =>
                      setMembershipExpiry(selectedDate!)
                    }
                  />
                </View>

                <Text style={styles.label}>Property Address</Text>
                <TextInput
                  value={propertyAddress}
                  onChangeText={setPropertyAddress}
                  placeholder="Property Address"
                  style={styles.input}
                />

                <Text style={styles.label}>Booking Fee</Text>
                <TextInput
                  value={bookingFee as string}
                  keyboardType="numeric"
                  onChangeText={setBookingFee}
                  placeholder="Booking Fee"
                  style={styles.input}
                />

                <Text style={styles.label}>Security Deposit</Text>
                <TextInput
                  value={securityDeposit as string}
                  onChangeText={setSecurityDeposit}
                  placeholder="Security Deposit"
                  style={styles.input}
                />

                <Text style={styles.label}>Membership Tier</Text>
                <TextInput
                  value={membershipTier}
                  onChangeText={setMembershipTier}
                  placeholder="Membership Tier"
                  style={styles.input}
                />

                <Text style={styles.label}>Payment Information</Text>
                <TextInput
                  value={paymentInformation}
                  onChangeText={setPaymentInformation}
                  placeholder="Payment Information"
                  style={styles.input}
                />

                <Text style={styles.label}>Nationality</Text>
                <TextInput
                  value={nationality}
                  onChangeText={setNationality}
                  placeholder="Nationality"
                  style={styles.input}
                />

                <Text style={styles.label}>ID</Text>
                <TextInput
                  value={id}
                  onChangeText={setId}
                  placeholder="ID"
                  style={styles.input}
                />

                <Text style={styles.label}>Employment Pass Details</Text>
                <TextInput
                  value={employmentPassDetails}
                  onChangeText={setEmploymentPassDetails}
                  placeholder="Employment Pass Details"
                  style={styles.input}
                />

                <View style={styles.dateRow}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <DateTimePicker
                    value={membershipExpiry}
                    mode="date"
                    onChange={(_, selectedDate) =>
                      setDateOfBirth(selectedDate!)
                    }
                  />
                </View>

                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity
                  onPress={() => setIsGenderModalVisible(true)}
                  style={styles.input}
                >
                  <Text style={{ marginTop: 4 }}>{gender}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Race</Text>
                <TextInput
                  value={race}
                  onChangeText={setRace}
                  placeholder="Race"
                  style={styles.input}
                />

                <Text style={styles.label}>Religion</Text>
                <TextInput
                  value={religion}
                  onChangeText={setReligion}
                  placeholder="Religion"
                  style={styles.input}
                />

                <Text style={styles.label}>Occupation</Text>
                <TextInput
                  value={occupation}
                  onChangeText={setOccupation}
                  placeholder="Occupation"
                  style={styles.input}
                />

                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  value={mobileNumber}
                  keyboardType="phone-pad"
                  onChangeText={setMobileNumber}
                  placeholder="Mobile Number (e.g. +65 1234 5678)"
                  style={styles.input}
                />
              </ScrollView>
            )}
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={isGenderModalVisible}
            onRequestClose={() => {
              setIsGenderModalVisible(!isGenderModalVisible);
            }}
          >
            <View style={styles.bottomModalView}>
              <View style={styles.bottomSheet}>
                <Text style={styles.bottomSheetTitle}>Select Gender</Text>
                <Pressable
                  onPress={() => {
                    setGender("Male");
                    setIsGenderModalVisible(!isGenderModalVisible);
                  }}
                  style={styles.bottomSheetButton}
                >
                  <Text>Male</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setGender("Female");
                    setIsGenderModalVisible(!isGenderModalVisible);
                  }}
                  style={styles.bottomSheetButton}
                >
                  <Text>Female</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24,
  },
  header: {
    fontFamily: "mon-b",
    fontSize: 24,
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.grey,
  },
  nameLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    padding: 2,
    marginBottom: 2,
  },
  editColumn: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 6,
    marginVertical: 2,
    padding: 2,
    paddingHorizontal: 4,
    marginRight: 8,
    marginBottom: 8,
    height: 32,
  },
  scrollViewContent: {
    minHeight: 1400, // Set a value greater than the height of the ScrollView
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 2,
    marginRight: 8,
  },
  bottomModalView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)", // Optional: for dimming background
  },
  bottomSheet: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetTitle: {
    textAlign: "center",
    marginBottom: 10,
  },
  bottomSheetButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});

export default Page;
