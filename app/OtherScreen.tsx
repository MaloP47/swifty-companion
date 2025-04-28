// app/other.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function OtherScreen() {
  const { user, logout } = useAuth();
  const { userData } = useLocalSearchParams();
  const searchedUser = userData ? JSON.parse(userData as string) : null;

  const handleLogout = () => {
    logout();
    router.replace("/LoginScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {searchedUser ? (
          <View style={styles.profileContainer}>
            <Image
              source={
                searchedUser.image?.versions?.medium
                  ? { uri: searchedUser.image.versions.medium }
                  : require("../assets/images/randomHacker.jpg")
              }
              style={styles.profileImage}
            />
            <Text style={styles.title}>{searchedUser.displayname}</Text>
            <Text style={styles.subtitle}>Login: {searchedUser.login}</Text>
            <Text style={styles.subtitle}>Email: {searchedUser.email}</Text>
            <Text style={styles.subtitle}>
              Location: {searchedUser.location || "Unavailable"}
            </Text>
            <Text style={styles.subtitle}>
              Wallet: {searchedUser.wallet || "0"}₳
            </Text>
            <Text style={styles.subtitle}>
              Correction Points: {searchedUser.correction_point}
            </Text>
            <Text style={styles.subtitle}>
              Level:{" "}
              {searchedUser.cursus_users
                ?.reduce(
                  (max: number, cursus: any) =>
                    Math.max(max, cursus.level || 0),
                  0
                )
                .toFixed(2) || "0"}
            </Text>

            {/* Latest Finished Projects */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Latest Finished Projects</Text>
              <View style={styles.scrollContainer}>
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={styles.verticalScroll}
                >
                  {searchedUser.projects_users
                    ?.filter(
                      (project: any) =>
                        project.status === "finished" && project.final_mark
                    )
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.marked_at).getTime() -
                        new Date(a.marked_at).getTime()
                    )
                    .map((project: any, index: number) => (
                      <View key={index} style={styles.projectItem}>
                        <Text style={styles.projectName}>
                          {project.project.name}
                        </Text>
                        <Text style={styles.projectGrade}>
                          Grade: {project.final_mark}
                        </Text>
                        <Text style={styles.projectDate}>
                          Completed:{" "}
                          {new Date(project.marked_at).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                </ScrollView>
              </View>
            </View>

            {/* Not Graded Projects */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Not Graded Projects</Text>
              <View style={styles.scrollContainer}>
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={styles.verticalScroll}
                >
                  {searchedUser.projects_users
                    ?.filter(
                      (project: any) =>
                        project.status === "in_progress" ||
                        project.status === "searching_a_group"
                    )
                    .map((project: any, index: number) => (
                      <View key={index} style={styles.projectItem}>
                        <Text style={styles.projectName}>
                          {project.project.name}
                        </Text>
                        <Text style={styles.projectStatus}>
                          Status: {project.status}
                        </Text>
                      </View>
                    ))}
                </ScrollView>
              </View>
            </View>

            {/* Failed Projects */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Failed Projects</Text>
              <View style={styles.scrollContainer}>
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={styles.verticalScroll}
                >
                  {searchedUser.projects_users
                    ?.filter(
                      (project: any) =>
                        project.status === "finished" &&
                        project["validated?"] === false
                    )
                    .map((project: any, index: number) => (
                      <View key={index} style={styles.projectItem}>
                        <Text style={styles.projectName}>
                          {project.project.name}
                        </Text>
                        <Text style={styles.projectGradeFailed}>
                          Grade: {project.final_mark}
                        </Text>
                      </View>
                    ))}
                </ScrollView>
              </View>
            </View>

            {/* Skills */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.scrollContainer}>
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={styles.verticalScroll}
                >
                  {searchedUser.cursus_users
                    ?.find((cursus: any) => cursus.cursus.name === "42cursus")
                    ?.skills?.map((skill: any, index: number) => {
                      const percentage = (skill.level / 30) * 100;
                      let color = "#FF0000"; // Default red
                      if (percentage >= 100) color = "#00FF00"; // Green
                      else if (percentage >= 75)
                        color = "#90EE90"; // Light green
                      else if (percentage >= 50) color = "#FFFF00"; // Yellow
                      else if (percentage >= 30) color = "#FFA500"; // Orange
                      else if (percentage >= 20) color = "#FF6347"; // Tomato
                      else if (percentage >= 10) color = "#FF4500"; // Orange red

                      return (
                        <View key={index} style={styles.skillItem}>
                          <View style={styles.skillHeader}>
                            <Text style={styles.skillName}>{skill.name}</Text>
                            <Text style={styles.skillPercentage}>
                              {percentage.toFixed(0)}%
                            </Text>
                          </View>
                          <View style={styles.progressBarContainer}>
                            <View
                              style={[
                                styles.progressBar,
                                {
                                  width: `${percentage}%`,
                                  backgroundColor: color,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.skillLevel}>
                            Level: {skill.level.toFixed(2)}/30
                          </Text>
                        </View>
                      );
                    })}
                </ScrollView>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.profileContainer}>
            <Text style={styles.title}>No user data available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#00babc",
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  section: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  scrollContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 5,
    backgroundColor: "white",
  },
  verticalScroll: {
    flex: 1,
  },
  projectItem: {
    backgroundColor: "rgba(0, 186, 188, 0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  projectGrade: {
    fontSize: 14,
    color: "#00babc",
    marginBottom: 5,
  },
  projectGradeFailed: {
    fontSize: 14,
    color: "red",
    marginBottom: 5,
  },
  projectStatus: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  projectDate: {
    fontSize: 12,
    color: "#999",
  },
  skillItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "rgba(0, 186, 188, 0.1)",
    borderRadius: 8,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  skillName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  skillPercentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00babc",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  skillLevel: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
});
