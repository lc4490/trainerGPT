import { Container, Box, Button, FormGroup, FormControlLabel, Checkbox, TextField, ToggleButtonGroup, ToggleButton, Typography, Slider } from '@mui/material';
import { motion } from 'framer-motion';

const StepForm = ({
  steps, currentStep, formData, handleInputChange, handleKeyPressStep, handleWeightUnitChange, weightUnit, handleHeightUnitChange, heightUnit, handleFeetChange, feet, handleInchesChange, inches, t, nextStep, prevStep, handleSubmit
}) => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          bgcolor: 'background.default',
          color: 'text.primary',
          paddingBottom: '60px',
        }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 50 }}
            animate={currentStep === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            style={{ display: currentStep === index ? 'block' : 'none', width: '100%' }}
          >
            <Typography variant="h4" gutterBottom>{t(step.title)}</Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>{t(step.content)}</Typography>

            {step.options ? (
              <ToggleButtonGroup
                exclusive
                value={formData[step.title] || ''}
                onChange={(e, value) => handleInputChange(step.title, value)}
                onKeyDown={handleKeyPressStep}
                sx={{ mb: 4 }}
              >
                {step.options.map((option) => (
                  <ToggleButton key={option} value={option}>
                    {t(option)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            ) : (
              step.inputType && (
                <>
                  {step.title === 'What is Your Weight?' ? (
                    // Weight input with unit switching
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData[step.title] || ''}
                        onChange={(e) => handleInputChange(step.title, parseFloat(e.target.value))}
                        onKeyDown={handleKeyPressStep}
                        sx={{ mb: 4 }}
                        placeholder={t("Enter weight")}
                        InputProps={{
                          endAdornment: (
                            <Typography variant="body1">
                              {weightUnit}
                            </Typography>
                          ),
                        }}
                      />
                      <ToggleButtonGroup
                        value={weightUnit}
                        exclusive
                        onChange={handleWeightUnitChange}
                        sx={{ mb: 4 }}
                      >
                        <ToggleButton value="kg">kg</ToggleButton>
                        <ToggleButton value="lbs">lbs</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  ) : step.title === 'What is Your Height?' ? (
                    // Height input with separate fields for feet and inches when in ft/in mode
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {console.log(feet)}
                      {console.log(inches)}
                      {heightUnit === 'ft/in' ? (
                      <>
                        <TextField
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={parseInt(feet) || ''}
                          onChange={(e) => handleFeetChange(e.target.value)}
                          onKeyDown={handleKeyPressStep}
                          sx={{ mb: 4 }}
                          placeholder={t("Feet")}
                          InputProps={{
                            endAdornment: (
                              <Typography variant="body1">
                                {t('ft')}
                              </Typography>
                            ),
                          }}
                        />
                        <TextField
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={parseInt(inches.replace('"', '')) || ''}
                          onChange={(e) => handleInchesChange(e.target.value)}
                          onKeyDown={handleKeyPressStep}
                          sx={{ mb: 4 }}
                          placeholder={t("Inches")}
                          InputProps={{
                            endAdornment: (
                              <Typography variant="body1">
                                {t('in')}
                              </Typography>
                            ),
                          }}
                        />
                      </>
                      ) : (
                        <TextField
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={formData[step.title] || ''}
                          onChange={(e) => handleInputChange(step.title, parseFloat(e.target.value))}
                          onKeyDown={handleKeyPressStep}
                          sx={{ mb: 4 }}
                          placeholder={t("Enter height in cm")}
                          InputProps={{
                            endAdornment: (
                              <Typography variant="body1">
                                {heightUnit}
                              </Typography>
                            ),
                          }}
                        />
                      )}
                      <ToggleButtonGroup
                        value={heightUnit}
                        exclusive
                        onChange={handleHeightUnitChange}
                        sx={{ mb: 4 }}
                      >
                        <ToggleButton value="cm">cm</ToggleButton>
                        <ToggleButton value="ft/in">ft/in</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  ) : step.inputType === 'dial' ? (
                    <Box sx={{ mb: 4 }}>
                      <Slider
                        defaultValue={3}
                        step={1}
                        marks
                        min={1}
                        max={7}
                        valueLabelDisplay="auto"
                        value={formData[step.title] || 1} // Default to 1 day if no value exists
                        onChange={(e, value) => handleInputChange(step.title, value)}
                        onKeyDown={handleKeyPressStep}
                      />
                    </Box>
                  ) : (
                    <TextField
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={formData[step.title] || ''}
                      onChange={(e) => {
                        if (step.title === 'How Old Are You?') {
                          const numericValue = e.target.value.replace(/[^0-9]/g, '');
                          handleInputChange(step.title, numericValue);
                        } else {
                          handleInputChange(step.title, e.target.value);
                        }
                      }}
                      onKeyDown={handleKeyPressStep}
                      sx={{ mb: 4 }}
                    />
                  )}
                </>
              )
            )}


            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                {t('Back')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
              >
                {currentStep === steps.length - 1 ? t('Finish') : t('Next')}
              </Button>
            </Box>
          </motion.div>
        ))}

      </Box>
    </Container>
  );
};

export default StepForm;
