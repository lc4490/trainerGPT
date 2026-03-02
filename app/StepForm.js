import {
  Box,
  Button,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";

const GRAD = "linear-gradient(90deg, #E53935, #FB8C00)";


const StepForm = ({
  steps,
  currentStep,
  formData,
  handleInputChange,
  handleKeyPressStep,
  handleWeightUnitChange,
  weightUnit,
  handleHeightUnitChange,
  heightUnit,
  handleFeetChange,
  feet,
  handleInchesChange,
  inches,
  t,
  nextStep,
  prevStep,
  handleSubmit,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const c = isDark
    ? {
        bg: "#111111",
        trackBg: "rgba(255,255,255,0.1)",
        label: "rgba(255,255,255,0.45)",
        title: "white",
        subtitle: "rgba(255,255,255,0.5)",
        tileBorder: "rgba(255,255,255,0.14)",
        tileBg: "rgba(255,255,255,0.04)",
        tileHoverBorder: "rgba(255,255,255,0.3)",
        tileHoverBg: "rgba(255,255,255,0.09)",
        input: "white",
        inputBorder: "rgba(255,255,255,0.18)",
        inputHoverBorder: "rgba(255,255,255,0.38)",
        inputPlaceholder: "rgba(255,255,255,0.35)",
        toggle: "rgba(255,255,255,0.6)",
        toggleBorder: "rgba(255,255,255,0.18)",
        toggleHoverBg: "rgba(255,255,255,0.07)",
        sliderRail: "rgba(255,255,255,0.18)",
        sliderMark: "rgba(255,255,255,0.25)",
        rangeLabel: "rgba(255,255,255,0.35)",
        backBorder: "rgba(255,255,255,0.2)",
        backColor: "rgba(255,255,255,0.7)",
        backHoverBg: "rgba(255,255,255,0.07)",
        backDisabledBorder: "rgba(255,255,255,0.1)",
        backDisabledColor: "rgba(255,255,255,0.4)",
      }
    : {
        bg: "#FAFAFA",
        trackBg: "rgba(0,0,0,0.08)",
        label: "rgba(0,0,0,0.45)",
        title: "#111111",
        subtitle: "rgba(0,0,0,0.5)",
        tileBorder: "rgba(0,0,0,0.12)",
        tileBg: "rgba(0,0,0,0.03)",
        tileHoverBorder: "rgba(0,0,0,0.25)",
        tileHoverBg: "rgba(0,0,0,0.06)",
        input: "#111111",
        inputBorder: "rgba(0,0,0,0.2)",
        inputHoverBorder: "rgba(0,0,0,0.38)",
        inputPlaceholder: "rgba(0,0,0,0.35)",
        toggle: "rgba(0,0,0,0.6)",
        toggleBorder: "rgba(0,0,0,0.18)",
        toggleHoverBg: "rgba(0,0,0,0.05)",
        sliderRail: "rgba(0,0,0,0.18)",
        sliderMark: "rgba(0,0,0,0.25)",
        rangeLabel: "rgba(0,0,0,0.35)",
        backBorder: "rgba(0,0,0,0.2)",
        backColor: "rgba(0,0,0,0.7)",
        backHoverBg: "rgba(0,0,0,0.05)",
        backDisabledBorder: "rgba(0,0,0,0.1)",
        backDisabledColor: "rgba(0,0,0,0.4)",
      };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      color: c.input,
      "& fieldset": { borderColor: c.inputBorder },
      "&:hover fieldset": { borderColor: c.inputHoverBorder },
      "&.Mui-focused fieldset": { borderColor: "#E53935" },
    },
    "& .MuiInputBase-input": { color: c.input },
    "& .MuiInputBase-input::placeholder": { color: c.inputPlaceholder, opacity: 1 },
  };

  const toggleSx = {
    color: c.toggle,
    borderColor: c.toggleBorder,
    "&.Mui-selected": {
      background: GRAD,
      color: "white",
      borderColor: "transparent",
      "&:hover": { opacity: 0.9 },
    },
    "&:hover": { bgcolor: c.toggleHoverBg },
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const step = steps[currentStep];
  const value = formData[step?.title];
  const isStepValid =
    step?.inputType === "dial"
      ? true // slider always has a usable default
      : step?.title === "What is Your Height?" && heightUnit === "ft/in"
        ? !!feet
        : value !== undefined && value !== "" && value !== null;

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: c.bg,
      }}
    >
      {/* Top bar: progress */}
      <Box sx={{ px: 3, pt: 2, pb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: c.label }}
          >
            Step {currentStep + 1} of {steps.length}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: c.label }}
          >
            {Math.round(progress)}%
          </Typography>
        </Box>

        {/* Gradient progress bar */}
        <Box
          sx={{
            width: "100%",
            height: 4,
            bgcolor: c.trackBg,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              borderRadius: 2,
              background: GRAD,
              width: `${progress}%`,
              transition: "width 0.4s ease",
            }}
          />
        </Box>
      </Box>

      {/* Step content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          px: 3,
          width: "100%",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "520px", mx: "auto", my: "auto" }}>
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: 40 }}
              animate={
                currentStep === index
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -40 }
              }
              transition={{ duration: 0.3 }}
              style={{
                display: currentStep === index ? "block" : "none",
                width: "100%",
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  color: c.title,
                  mb: 1,
                  fontFamily: '"Gilroy", "Arial", sans-serif',
                }}
              >
                {t(step.title)}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: c.subtitle, mb: 4, lineHeight: 1.6 }}
              >
                {t(step.content)}
              </Typography>

              {/* Card-style option picker */}
              {step.options && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
                  {step.options.map((option) => {
                    const selected = formData[step.title] === option;
                    return (
                      <Box
                        key={option}
                        onClick={() => handleInputChange(step.title, option)}
                        sx={{
                          flex: "1 1 calc(50% - 8px)",
                          minWidth: 120,
                          py: 2.5,
                          px: 3,
                          borderRadius: 2,
                          cursor: "pointer",
                          border: "1px solid",
                          borderColor: selected ? "transparent" : c.tileBorder,
                          background: selected ? GRAD : c.tileBg,
                          transition: "all 0.2s",
                          textAlign: "center",
                          "&:hover": {
                            borderColor: selected ? "transparent" : c.tileHoverBorder,
                            background: selected ? GRAD : c.tileHoverBg,
                          },
                        }}
                      >
                        <Typography
                          fontWeight="bold"
                          sx={{ color: selected ? "white" : c.title, fontSize: "0.95rem" }}
                        >
                          {t(option)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Text / number / dial inputs */}
              {!step.options && step.inputType && (
                <>
                  {step.title === "What is Your Weight?" ? (
                    <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                      <TextField
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData[step.title] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            step.title,
                            parseFloat(e.target.value),
                          )
                        }
                        onKeyDown={handleKeyPressStep}
                        placeholder={t("Enter weight")}
                        InputProps={{
                          endAdornment: (
                            <Typography
                              sx={{
                                color: c.label,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {weightUnit}
                            </Typography>
                          ),
                        }}
                        sx={textFieldSx}
                      />
                      <ToggleButtonGroup
                        value={weightUnit}
                        exclusive
                        onChange={handleWeightUnitChange}
                        sx={{ flexShrink: 0 }}
                      >
                        <ToggleButton value="kg" sx={toggleSx}>
                          kg
                        </ToggleButton>
                        <ToggleButton value="lbs" sx={toggleSx}>
                          lbs
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  ) : step.title === "What is Your Height?" ? (
                    <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                      {heightUnit === "ft/in" ? (
                        <>
                          <TextField
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={parseInt(feet) || ""}
                            onChange={(e) => handleFeetChange(e.target.value)}
                            onKeyDown={handleKeyPressStep}
                            placeholder={t("Feet")}
                            InputProps={{
                              endAdornment: (
                                <Typography
                                  sx={{ color: c.label }}
                                >
                                  {t("ft")}
                                </Typography>
                              ),
                            }}
                            sx={textFieldSx}
                          />
                          <TextField
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={parseInt(inches.replace('"', "")) || ""}
                            onChange={(e) => handleInchesChange(e.target.value)}
                            onKeyDown={handleKeyPressStep}
                            placeholder={t("Inches")}
                            InputProps={{
                              endAdornment: (
                                <Typography
                                  sx={{ color: c.label }}
                                >
                                  {t("in")}
                                </Typography>
                              ),
                            }}
                            sx={textFieldSx}
                          />
                        </>
                      ) : (
                        <TextField
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={formData[step.title] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              step.title,
                              parseFloat(e.target.value),
                            )
                          }
                          onKeyDown={handleKeyPressStep}
                          placeholder={t("Enter height in cm")}
                          InputProps={{
                            endAdornment: (
                              <Typography
                                sx={{ color: c.label }}
                              >
                                {heightUnit}
                              </Typography>
                            ),
                          }}
                          sx={textFieldSx}
                        />
                      )}
                      <ToggleButtonGroup
                        value={heightUnit}
                        exclusive
                        onChange={handleHeightUnitChange}
                        sx={{ flexShrink: 0 }}
                      >
                        <ToggleButton value="cm" sx={toggleSx}>
                          cm
                        </ToggleButton>
                        <ToggleButton value="ft/in" sx={toggleSx}>
                          ft/in
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  ) : step.inputType === "dial" ? (
                    <Box sx={{ mb: 4, px: 1 }}>
                      {/* Large numeric display */}
                      <Typography
                        variant="h2"
                        fontWeight="bold"
                        textAlign="center"
                        sx={{
                          background: GRAD,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          mb: 3,
                          lineHeight: 1,
                        }}
                      >
                        {formData[step.title] || step.range?.min || 1}
                      </Typography>
                      <Slider
                        step={1}
                        marks
                        min={step.range?.min || 1}
                        max={step.range?.max || 7}
                        valueLabelDisplay="auto"
                        value={formData[step.title] || step.range?.min || 1}
                        onChange={(_e, value) =>
                          handleInputChange(step.title, value)
                        }
                        onKeyDown={handleKeyPressStep}
                        sx={{
                          "& .MuiSlider-thumb": {
                            background: GRAD,
                            border: "none",
                            boxShadow: "0 0 0 8px rgba(229,57,53,0.16)",
                          },
                          "& .MuiSlider-track": {
                            background: GRAD,
                            border: "none",
                          },
                          "& .MuiSlider-rail": {
                            bgcolor: c.sliderRail,
                          },
                          "& .MuiSlider-mark": {
                            bgcolor: c.sliderMark,
                          },
                          "& .MuiSlider-markActive": { background: "white" },
                        }}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: c.rangeLabel }}
                        >
                          {step.range?.min || 1}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: c.rangeLabel }}
                        >
                          {step.range?.max || 7}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <TextField
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={formData[step.title] || ""}
                      onChange={(e) => handleInputChange(step.title, e.target.value)}
                      onKeyDown={handleKeyPressStep}
                      sx={{ ...textFieldSx, mb: 4 }}
                    />
                  )}
                </>
              )}
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          px: 3,
          pb: 8,
          pt: 2,
          maxWidth: "520px",
          width: "100%",
          mx: "auto",
          display: "flex",
          gap: 2,
        }}
      >
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: "99999px",
            border: `1px solid ${c.backBorder}`,
            color: c.backColor,
            "&:hover": { bgcolor: c.backHoverBg },
            "&:disabled": {
              opacity: 1,
              color: c.backDisabledColor,
              border: `1px solid ${c.backDisabledBorder}`,
            },
          }}
        >
          {t("Back")}
        </Button>
        <Button
          onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
          disabled={!isStepValid}
          sx={{
            flex: 2,
            py: 1.5,
            borderRadius: "99999px",
            background: GRAD,
            color: "white",
            fontWeight: "bold",
            fontSize: "1rem",
            "&:hover": { opacity: 0.88 },
            "&:disabled": { opacity: 0.35, color: "white" },
          }}
        >
          {currentStep === steps.length - 1 ? t("Finish") : t("Next")}
        </Button>
      </Box>
    </Box>
  );
};

export default StepForm;
