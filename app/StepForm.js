import { Container, Box, Button, FormGroup, FormControlLabel, Checkbox, TextField, ToggleButtonGroup, ToggleButton, Typography, Slider } from '@mui/material';
import { motion } from 'framer-motion';

const StepForm = ({
  steps, currentStep, formData, handleInputChange, handleKeyPressStep, handleWeightUnitChange, weightUnit, handleHeightUnitChange, heightUnit, t, nextStep, prevStep, handleSubmit
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
                  {(step.title === 'What is Your Weight?' || step.title === 'What is Your Height?') ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData[step.title] || ''}
                        onChange={(e) => {
                          if (step.title === 'What is Your Height?' && heightUnit === 'ft/in') {
                            handleInputChange(step.title, e.target.value);
                          } else {
                            handleInputChange(step.title, parseFloat(e.target.value));
                          }
                        }}
                        onKeyDown={handleKeyPressStep}
                        sx={{ mb: 4 }}
                        placeholder={
                          step.title === 'What is Your Height?' && heightUnit === 'ft/in' 
                            ? t("e.g., 5'8\"") 
                            : (step.title === 'What is Your Height?' ? t("Enter height in cm") : "")
                        }
                        InputProps={{
                          endAdornment: (
                            <Typography variant="body1">
                              {step.title === 'What is Your Weight?' ? weightUnit : heightUnit}
                            </Typography>
                          ),
                        }}
                      />
                      <ToggleButtonGroup
                        value={step.title === 'What is Your Weight?' ? weightUnit : heightUnit}
                        exclusive
                        onChange={step.title === 'What is Your Weight?' ? handleWeightUnitChange : handleHeightUnitChange}
                        sx={{ mb: 4 }}
                      >
                        {step.title === 'What is Your Weight?' ? (
                          [
                            <ToggleButton key="kg" value="kg">kg</ToggleButton>,
                            <ToggleButton key="lbs" value="lbs">lbs</ToggleButton>,
                          ]
                        ) : (
                          [
                            <ToggleButton key="cm" value="cm">cm</ToggleButton>,
                            <ToggleButton key="ft/in" value="ft/in">ft/in</ToggleButton>,
                          ]
                        )}
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
