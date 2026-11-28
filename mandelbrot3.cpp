#include <iostream>
#include <math.h>

extern "C"
{
    extern void makeRowFloat(float re, float im, float step, int speclen, int maxitr, unsigned char *palette,
                             unsigned char *out, unsigned long long width)
    {

        for (int i = 0; i < width; i++)
        {
            float re2 = re + (step * i);
            float cre = re2, cim = im;
            bool broke = false;
            int j;
            for (j = 0; j < maxitr; j++)
            {
                float reim = cre * cim;
                cre *= cre;
                cim *= cim;
                if (cre + cim > 4)
                {
                    broke = true;
                    break;
                }
                cre += re2 - cim;
                cim = reim + reim + im;
            }
            if (broke)
            {
                // palette
                unsigned char res = (j * 256) / speclen; // truncation needed
                out[i * 3] = palette[3 * res];
                out[i * 3 + 1] = palette[3 * res + 1];
                out[i * 3 + 2] = palette[3 * res + 2];
            }
            else
            {
                out[i * 3] = 0;
                out[i * 3 + 1] = 0;
                out[i * 3 + 2] = 0;
            }
        }
    }
    extern void makeRowDouble(double re, double im, double step, int speclen, int maxitr, unsigned char *palette,
                              unsigned char *out, unsigned long long width)
    {

        for (int i = 0; i < width; i++)
        {
            double re2 = re + (step * i);
            double cre = re2, cim = im;
            bool broke = false;
            int j;
            for (j = 0; j < maxitr; j++)
            {
                double reim = cre * cim;
                cre *= cre;
                cim *= cim;
                if (cre + cim > 4)
                {
                    broke = true;
                    break;
                }
                cre += re2 - cim;
                cim = reim + reim + im;
            }
            if (broke)
            {
                // palette
                unsigned char res = (j * 256) / speclen; // truncation needed
                out[i * 3] = palette[3 * res];
                out[i * 3 + 1] = palette[3 * res + 1];
                out[i * 3 + 2] = palette[3 * res + 2];
            }
            else
            {
                out[i * 3] = 0;
                out[i * 3 + 1] = 0;
                out[i * 3 + 2] = 0;
            }
        }
    }
    extern void makeRowPert(double re, double im, double step, int speclen, int maxitr, unsigned char *palette,
                            unsigned char *out, unsigned long long width, int reflen, double *refre, double *refim)
    {

        for (int i = 0; i < width; i++)
        {
            // basically mashing together my mandelbrotdeep pertubation code and the origional mandelbrotwasm color handling and positioning
            double dcre = re + i * step;
            double dcim = im;
            double dre = 0, dim = 0;
            // thank you to fractalforums user Zhuoran for the new technique (https://fractalforums.org/index.php?topic=4360.0)
            int itr;
            int refPos = 0;
            int escaped = false;
            for (itr = 0; itr < maxitr; itr++)
            {
                // standard pertubstion formula
                // 2*ref+delta
                double inter1re = 2 * refre[refPos] + dre; // intermediate 1 re
                double inter1im = 2 * refim[refPos] + dim; // intermediate 1 im
                // inter1*delta (multiplication is annoying)
                double inter2re = inter1re * dre - inter1im * dim; // intermediate 2 re
                double inter2im = inter1re * dim + inter1im * dre; // intermediate 2 im
                // inter2+dc -> delta
                dre = inter2re + dcre;
                dim = inter2im + dcim;
                refPos++;
                // recombine to z
                double zre = refre[refPos] + dre;
                double zim = refim[refPos] + dim;
                // magnitude of z (squared)
                double zmag = zre * zre + zim * zim;
                if (zmag > 4)
                {

                    // palette
                    unsigned char res = (itr * 256) / speclen; // truncation needed
                    out[i * 3] = palette[3 * res];
                    out[i * 3 + 1] = palette[3 * res + 1];
                    out[i * 3 + 2] = palette[3 * res + 2];
                    escaped = true;
                    break;
                }
                if ((zmag < dre * dre + dim * dim) || (refPos == reflen - 1))
                {
                    // The INSANE INNOVATION (I don't know why it just works)
                    refPos = 0;
                    dre = zre;
                    dim = zim;
                }
            }
            if (!escaped)
            {
                out[i * 3] = 0;
                out[i * 3 + 1] = 0;
                out[i * 3 + 2] = 0;
            }
        }
    }
}
