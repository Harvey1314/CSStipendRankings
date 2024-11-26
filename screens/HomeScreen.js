import React, { useState, useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Papa from "papaparse"; // For parsing CSV data
import { Picker } from "@react-native-picker/picker"; // Correct Picker import

// URL to the raw CSV file
const csvUrl =
  "https://raw.githubusercontent.com/CSStipendRankings/CSStipendRankings/main/stipend-us.csv";

export default function HomeScreen() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    stipendType: "",
    phdStage: "",
    institutionType: "",
    sortBy: "stipend",
  });

  // Fetch and parse CSV data from the online URL
  const fetchCSVData = async () => {
    try {
      setLoading(true);

      const response = await fetch(csvUrl);
      const csvText = await response.text();

      const parsedData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      }).data;

      const formattedData = parsedData.map((row, index) => {
        const trimmedRow = Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key.trim(),
            value ? value.trim() : value,
          ])
        );

        // Parse numerical values or fallback to 0
        const stipendPre = parseFloat(trimmedRow["pre_qual stipend"]) || 0;
        const stipendPost = parseFloat(trimmedRow["after_qual stipend"]) || 0;
        const fees = parseFloat(trimmedRow["fee"]) || 0; // Fees Calculation
        const livingCost = parseFloat(trimmedRow["living cost"]) || 0; // Living Cost Calculation

        // Determine stipend based on qualification stage
        const isPreQual = filters.phdStage === "Pre-Qualification";
        const stipend = isPreQual ? stipendPre : stipendPost;

        // Calculate disposable income (After Fees & Living)
        const afterFeesLiving = stipend - fees - livingCost;

        return {
          ...trimmedRow,
          index: index + 1,
          stipendPre,
          stipendPost,
          stipend,
          fees,
          livingCost,
          afterFeesLiving,
          institutionType: trimmedRow["public/private"]?.toLowerCase() || "unknown",
          phdStage: trimmedRow["labels"]?.includes("summer-gtd")
            ? "Pre-Qualification"
            : "Post-Qualification",
          labels: trimmedRow["labels"] || "",
        };
      });

      setData(formattedData);
      setFilteredData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching CSV data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, []);

  const applyFilters = () => {
    let filtered = [...data];

    // Filter by institution type
    if (filters.institutionType) {
      filtered = filtered.filter(
        (item) => item.institutionType === filters.institutionType
      );
    }

    // Filter by stipend type
    if (filters.stipendType) {
      filtered = filtered.filter((item) => item.labels.includes(filters.stipendType));
    }

    // Filter by PhD stage
    if (filters.phdStage) {
      filtered = filtered.filter((item) => item.phdStage === filters.phdStage);
    }

    // Sort filtered data
    filtered.sort((a, b) => {
      if (filters.sortBy === "stipend") return b.stipend - a.stipend;
      if (filters.sortBy === "fees") return b.fees - a.fees;
      if (filters.sortBy === "livingCost") return b.livingCost - a.livingCost;
      if (filters.sortBy === "afterFeesLiving")
        return b.afterFeesLiving - a.afterFeesLiving;
      return 0;
    });

    setFilteredData(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Determine row color based on institution type
  const getRowColor = (type) => {
    if (type === "private") return "rgba(138, 43, 226, 0.1)"; // Light violet
    if (type === "public") return "rgba(50, 205, 50, 0.1)"; // Light green
    return "white"; // Default white color
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.filters}>
            <Text>Stipend Type</Text>
            <Picker
              selectedValue={filters.stipendType}
              onValueChange={(itemValue) =>
                setFilters({ ...filters, stipendType: itemValue })
              }
            >
              <Picker.Item label="All" value="" />
              <Picker.Item label="Guaranteed" value="summer-gtd" />
              <Picker.Item label="No Guarantee" value="no-guarantee" />
            </Picker>

            <Text>PhD Stage</Text>
            <Picker
              selectedValue={filters.phdStage}
              onValueChange={(itemValue) =>
                setFilters({ ...filters, phdStage: itemValue })
              }
            >
              <Picker.Item label="All" value="" />
              <Picker.Item label="Pre-Qualification" value="Pre-Qualification" />
              <Picker.Item
                label="Post-Qualification"
                value="Post-Qualification"
              />
            </Picker>

            <Text>Institution Type</Text>
            <Picker
              selectedValue={filters.institutionType}
              onValueChange={(itemValue) =>
                setFilters({ ...filters, institutionType: itemValue })
              }
            >
              <Picker.Item label="All" value="" />
              <Picker.Item label="Public" value="public" />
              <Picker.Item label="Private" value="private" />
            </Picker>

            <Text>Sort By</Text>
            <Picker
              selectedValue={filters.sortBy}
              onValueChange={(itemValue) =>
                setFilters({ ...filters, sortBy: itemValue })
              }
            >
              <Picker.Item label="Stipend" value="stipend" />
              <Picker.Item label="Fees" value="fees" />
              <Picker.Item label="Living Cost" value="livingCost" />
              <Picker.Item label="After Fees & Living" value="afterFeesLiving" />
            </Picker>
          </ScrollView>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Institution</Text>
            <Text style={styles.headerCell}>Stipend ($)</Text>
            <Text style={styles.headerCell}>Fees ($)</Text>
            <Text style={styles.headerCell}>Living Cost ($)</Text>
            <Text style={styles.headerCell}>After Fees & Living ($)</Text>
          </View>

          {/* Render filtered data */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.index.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.row,
                  { backgroundColor: getRowColor(item.institutionType) },
                ]}
              >
                <Text style={styles.cell}>{item.institution}</Text>
                <Text style={styles.cell}>{item.stipend.toFixed(2)}</Text>
                <Text style={styles.cell}>{item.fees.toFixed(2)}</Text>
                <Text style={styles.cell}>{item.livingCost.toFixed(2)}</Text>
                <Text style={styles.cell}>{item.afterFeesLiving.toFixed(2)}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}
export const calculateAfterFeesLiving = (stipend, fees, livingCost) => stipend - fees - livingCost;
export const filterData = (data, filters) => { /* Filter logic */ };
export const sortData = (data, sortBy) => { /* Sorting logic */ };


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  filters: {
    paddingBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f1f1f1",
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
});
